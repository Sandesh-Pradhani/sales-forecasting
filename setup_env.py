import subprocess
import sys

# Read requirements
with open('requirements.txt', 'r') as f:
    requirements = [line.strip() for line in f if line.strip() and not line.startswith('#')]

print("Installing dependencies...")
for req in requirements:
    print(f"Installing: {req}")
    subprocess.check_call([sys.executable, '-m', 'pip', 'install', req])
    
print("All dependencies installed!")
