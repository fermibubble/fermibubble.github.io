"""Inspectable teaching fixtures, not a production runtime or model benchmark."""
from collections import Counter
from datetime import datetime
from pathlib import Path
import csv
import json
import math
import random


def instant(value):
    value = datetime.fromisoformat(value.replace('Z', '+00:00'))
    if value.utcoffset() is None:
        raise ValueError('A timezone is required')
    return value


def checkpoint(records, cutoff):
    """Both occurrence and availability must precede the checkpoint."""
    boundary = instant(cutoff)
    return [dict(r) for r in records
            if instant(r['event_time']) <= boundary and instant(r['available_at']) <= boundary]


def commit_owned(state, *, expected_version, owner, value):
    """Single-threaded fixture. Production requires atomic database CAS."""
    if state['version'] != expected_version or state['owner'] != owner or state['status'] != 'running':
        return False
    state.update(value=value, version=state['version'] + 1)
    return True


def evidence_complete(expected, observed, export_complete):
    expected, observed = set(expected), set(observed)
    return {'complete': bool(export_complete and expected <= observed),
            'missing': sorted(expected - observed), 'unexpected': sorted(observed - expected)}


def binary_counts(population, prevalence, recall, false_positive_rate):
    if population <= 0 or any(not 0 <= x <= 1 for x in (prevalence, recall, false_positive_rate)):
        raise ValueError('Positive population and probabilities in [0,1] required')
    tp = population * prevalence * recall
    fp = population * (1 - prevalence) * false_positive_rate
    return {'tp': tp, 'fp': fp, 'fn': population * prevalence - tp,
            'tn': population * (1 - prevalence) - fp, 'precision': tp / (tp + fp) if tp + fp else None}


def expand_labels(labels, parents):
    """Include ancestors, but exclude the shared root from scoring."""
    result = set()
    for label in labels:
        if label not in parents:
            raise ValueError(f'Unknown label: {label}')
        seen = set()
        while label is not None:
            if label in seen or label not in parents:
                raise ValueError('Cyclic or incomplete taxonomy')
            seen.add(label)
            if parents[label] is not None:
                result.add(label)
            label = parents[label]
    return result


def set_scores(predicted, expected):
    predicted, expected = set(predicted), set(expected)
    overlap = len(predicted & expected)
    # Empty/empty is a correct empty assignment. Undefined denominators remain null.
    return {'exact': predicted == expected,
            'precision': overlap / len(predicted) if predicted else None,
            'recall': overlap / len(expected) if expected else None,
            'jaccard': overlap / len(predicted | expected) if predicted | expected else 1.0}


def calibration_bins(rows, bins=5):
    if not isinstance(bins, int) or bins < 1:
        raise ValueError('Positive integer bin count required')
    buckets = [[] for _ in range(bins)]
    for probability, outcome in rows:
        if not 0 <= probability <= 1 or outcome not in (0, 1):
            raise ValueError('Invalid probability or binary outcome')
        buckets[min(int(probability * bins), bins - 1)].append((probability, outcome))
    return [{'bin': i, 'n': len(group),
             'mean_probability': sum(p for p, _ in group) / len(group) if group else None,
             'observed_frequency': sum(y for _, y in group) / len(group) if group else None}
            for i, group in enumerate(buckets)]


def paired_interval(rows, seed=19, draws=10000):
    """Percentile bootstrap over independent TASK pairs, not repeated turns."""
    if not rows or draws < 100:
        raise ValueError('Paired tasks and at least 100 bootstrap draws required')
    if len({r['task_id'] for r in rows}) != len(rows):
        raise ValueError('Aggregate repetitions within task before resampling')
    for row in rows:
        if any(row[k] not in (0, 1) for k in ('baseline', 'candidate')):
            raise ValueError('Binary task outcomes required')
    differences = [r['candidate'] - r['baseline'] for r in rows]
    rng = random.Random(seed)
    samples = sorted(sum(rng.choices(differences, k=len(rows))) / len(rows) for _ in range(draws))
    return {'tasks': len(rows), 'baseline': sum(r['baseline'] for r in rows) / len(rows),
            'candidate': sum(r['candidate'] for r in rows) / len(rows),
            'delta': sum(differences) / len(rows),
            'interval_95': [samples[int(.025 * draws)], samples[int(.975 * draws)]],
            'seed': seed, 'draws': draws, 'method': 'paired task percentile bootstrap',
            'scope': 'illustrative independent tasks; no model runs'}


def adapter_report():
    """Test an output adapter on fixed transcripts and oracle requirements."""
    cases = json.loads(Path(__file__).with_name('adapter-cases.json').read_text())
    adapters = {
        'raw': lambda lines: lines,
        'errors_only': lambda lines: [x for x in lines if x.startswith('ERROR')],
        'diagnostics': lambda lines: [x for x in lines if x.startswith(('ERROR', 'WARN'))],
    }
    result = []
    for name, transform in adapters.items():
        outcomes = []
        for case in cases:
            output = '\n'.join(transform(case['lines']))
            outcomes.append({'case': case['id'], 'required_retained': all(x in output for x in case['required']),
                             'utf8_bytes': len(output.encode())})
        result.append({'adapter': name, 'cases': outcomes,
                       'passed': sum(x['required_retained'] for x in outcomes),
                       'total': len(outcomes), 'utf8_bytes': sum(x['utf8_bytes'] for x in outcomes)})
    return result


def main():
    with Path(__file__).with_name('paired-outcomes.csv').open() as stream:
        rows = [dict(task_id=r['task_id'], baseline=int(r['baseline']), candidate=int(r['candidate'])) for r in csv.DictReader(stream)]
    report = {'paired_release': paired_interval(rows), 'adapter': adapter_report(),
              'rare_event': binary_counts(10000, .01, .9, .05)}
    print(json.dumps(report, indent=2))


if __name__ == '__main__':
    main()
