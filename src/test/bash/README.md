# Simple Lint Testing Framework

To run all tests, writing test output to 'test-output in the current
working directory:

    run-tests.sh test-output

To add a new test:

1. Create a test directory adjacent to this file.
2. Put the NIT definitions to run into a subdirectory called '<testdir>/nits'
3. Create an HTML input file at '<testdir>/input.html'
4. Create an expected output file at '<testdir>/expected-output.html'