"""Run actual compiler/runtime cases. Requires JDK 17+; no model calls."""
import json
import subprocess
import tempfile
from pathlib import Path

CASES = {
 'clean': ('public class Case { public static void main(String[] args) { System.out.println(5); } }', 0, 0),
 'compile_error': ('public class Case { public static void main(String[] args) { int value = "wrong"; } }', 1, None),
 'unchecked_runtime_failure': ('''import java.util.List;
public class Case {
  public static void main(String[] args) {
    List<Integer> values = (List<Integer>)(Object)List.of("wrong");
    System.out.println(values.get(0) + 1);
  }
}''', 0, 1),
}

def run():
    version = subprocess.run(['java','--version'], capture_output=True,text=True,check=True).stdout.splitlines()[0]
    records=[]
    with tempfile.TemporaryDirectory() as temporary:
        root=Path(temporary)
        for name,(source,compile_exit,run_exit) in CASES.items():
            case=root/name;case.mkdir();(case/'Case.java').write_text(source+'\n')
            for trial in range(1,4):
                compiled=subprocess.run(['java','com.sun.tools.javac.Main','-Xlint:unchecked','Case.java'],cwd=case,capture_output=True,text=True,timeout=30)
                if compiled.returncode != compile_exit: raise AssertionError((name,compiled.stderr))
                executed=None
                if compiled.returncode==0:
                    executed=subprocess.run(['java','-cp','.','Case'],cwd=case,capture_output=True,text=True,timeout=10)
                    if executed.returncode != run_exit: raise AssertionError((name,executed.stderr))
                raw=compiled.stderr
                errors_only=raw if 'error:' in raw else ''
                # Preserve full diagnostic blocks and source locations.
                diagnostics=raw if any(marker in raw for marker in ('error:', 'warning:')) else ''
                records.append(dict(case=name,trial=trial,compiler_exit=compiled.returncode,
                  runtime_exit=executed.returncode if executed else None,
                  raw_diagnostics=raw,runtime_stderr=executed.stderr if executed else None,
                  raw_bytes=len(raw.encode()),errors_only_bytes=len(errors_only.encode()),
                  diagnostics_bytes=len(diagnostics.encode()),
                  warning_retained_by_errors_only=('warning:' in errors_only) if 'warning:' in raw else None))
    return dict(environment=version,scope='Three deliberately constructed Java programs, three repeated trials each. Diagnostic retention experiment, not an LLM or performance benchmark.',records=records)

if __name__=='__main__': print(json.dumps(run(),indent=2))
