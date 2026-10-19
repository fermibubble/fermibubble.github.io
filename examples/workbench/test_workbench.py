import unittest
import workbench as w

class BoundaryTests(unittest.TestCase):
    def test_replay_late_arrival_excluded(self):
        rows = [dict(id='late', event_time='2026-01-01T09:00:00Z', available_at='2026-01-01T11:00:00Z'), dict(id='known', event_time='2026-01-01T09:00:00Z', available_at='2026-01-01T09:05:00Z')]
        self.assertEqual([r['id'] for r in w.checkpoint(rows, '2026-01-01T10:00:00Z')], ['known'])
    def test_replay_timezone_required(self):
        with self.assertRaises(ValueError): w.instant('2026-01-01T10:00:00')
    def test_replay_equal_boundary_and_offset(self):
        rows = [dict(event_time='2026-01-01T12:00:00+02:00', available_at='2026-01-01T10:00:00Z')]
        self.assertEqual(len(w.checkpoint(rows, '2026-01-01T10:00:00Z')), 1)
    def test_cancelled_owner_cannot_write(self):
        state = dict(version=42, owner='a', status='cancelled', value=None)
        self.assertFalse(w.commit_owned(state, expected_version=41, owner='a', value='late'))
        self.assertIsNone(state['value'])
    def test_wrong_owner_same_version(self):
        state = dict(version=1, owner='a', status='running')
        self.assertFalse(w.commit_owned(state, expected_version=1, owner='b', value=1))
    def test_repeated_commit_rejected(self):
        state = dict(version=1, owner='a', status='running')
        self.assertTrue(w.commit_owned(state, expected_version=1, owner='a', value=1))
        self.assertFalse(w.commit_owned(state, expected_version=1, owner='a', value=2))
    def test_export_completion_does_not_prove_coverage(self):
        self.assertFalse(w.evidence_complete(['east','west'], ['east'], True)['complete'])
    def test_coverage_does_not_prove_export_completion(self):
        self.assertFalse(w.evidence_complete(['east'], ['east'], False)['complete'])
    def test_duplicate_rows_do_not_fill_missing_scope(self):
        self.assertEqual(w.evidence_complete(['east','west'], ['east','east'], True)['missing'], ['west'])
    def test_prevalence_changes_precision(self):
        low=w.binary_counts(10000,.01,.9,.05); high=w.binary_counts(10000,.5,.9,.05)
        self.assertEqual((low['tp'],low['fp']), (90,495)); self.assertLess(low['precision'],high['precision'])
    def test_no_positive_predictions_is_undefined(self):
        self.assertIsNone(w.binary_counts(100,0,.9,0)['precision'])
    def test_invalid_rate_rejected(self):
        with self.assertRaises(ValueError): w.binary_counts(100,1.1,.9,.05)
    def test_hierarchy_excludes_shared_root(self):
        parents={'root':None,'billing':'root','refund':'billing','shipping':'root'}
        self.assertEqual(w.expand_labels(['refund'],parents), {'billing','refund'})
        self.assertEqual(w.set_scores(w.expand_labels(['refund'],parents),w.expand_labels(['shipping'],parents))['jaccard'],0)
    def test_hierarchy_cycle_rejected(self):
        with self.assertRaises(ValueError): w.expand_labels(['a'],{'a':'b','b':'a'})
    def test_unknown_label_rejected(self):
        with self.assertRaises(ValueError): w.expand_labels(['missing'],{'root':None})
    def test_empty_sets_explicit(self):
        score=w.set_scores([],[]); self.assertTrue(score['exact']); self.assertIsNone(score['recall']); self.assertEqual(score['jaccard'],1)
    def test_calibration_one_in_last_bin(self):
        rows=w.calibration_bins([(1,0),(1,1)],5)
        self.assertEqual(rows[-1]['observed_frequency'],.5); self.assertEqual(rows[-1]['n'],2); self.assertIsNone(rows[0]['observed_frequency'])
    def test_calibration_rejects_invalid(self):
        with self.assertRaises(ValueError): w.calibration_bins([(1.2,1)])
    def test_identical_pairs_have_zero_delta(self):
        result=w.paired_interval([dict(task_id=str(i),baseline=i%2,candidate=i%2) for i in range(10)],draws=100)
        self.assertEqual(result['interval_95'],[0,0])
    def test_repeated_tasks_must_be_clustered(self):
        with self.assertRaises(ValueError): w.paired_interval([dict(task_id='x',baseline=0,candidate=1)]*3)
    def test_warning_only_failure_detected(self):
        rows={r['adapter']:r for r in w.adapter_report()}
        self.assertEqual(rows['raw']['passed'],rows['raw']['total'])
        self.assertLess(rows['errors_only']['passed'],rows['raw']['passed'])
        self.assertEqual(rows['diagnostics']['passed'],rows['raw']['passed'])
        self.assertLess(rows['diagnostics']['utf8_bytes'],rows['raw']['utf8_bytes'])

if __name__ == '__main__': unittest.main()
