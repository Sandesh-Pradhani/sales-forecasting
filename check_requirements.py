with open('requirements.txt', 'r') as f:
    content = f.read()
    print(f"Requirements file content (length: {len(content)}):")
    print(repr(content))
    print("---")
    print(content)
