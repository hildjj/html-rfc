IETF RFCs with the authoring, archival, and reading formats all being HTML.

A prototype, for now.


### Lint Usage
Write output to a named file (can be the same as input file):

    node src/main/javascript input.html output.html

Write output to stdout:

    node src/main/javascript input.html -


### Testing changes to lint program
The lint process supports an optional 'nitdir' argument, which is a handy way
to run tests of expected behavior. There is currently no automated regression
or unit testing, but it would be straightforward to convert the semi-automatic
tests to automated ones.

To run tests:

    node src/main/javascript --nitdir src/test/javascript/basics src/test/resources/test-basics.html /tmp/out.html


### License
This code is licensed under the [Apache Software License, 2.0](http://www.apache.org/licenses/LICENSE-2.0)
