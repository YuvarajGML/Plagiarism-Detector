"""Small demo runner that invokes run_match and prints sample output."""
import subprocess
import sys

def demo():
    cmd = [sys.executable, 'run_match.py', 'TextFiles', 'pattern.txt', '--algo', 'horspool', '--mode', 'sentence', '--threshold', '0.7']
    print('Running:', ' '.join(cmd))
    subprocess.run(cmd, check=True)

if __name__ == '__main__':
    demo()
