IETF RFCs with the authoring, archival, and reading formats all being HTML.

A prototype, for now.

### Installation

Eventually, this project will be put into [NPM](http://npmjs.org/).  Until then:

	git clone git://github.com/IETF-Formatters/html-rfc.git
	cd html-rfc
	npm install

### idemponit Usage
Convert input.html to output.html, fixing it up:

    bin/idemponit input.html output.html

Convert input.html in-place, making input.html.bak be the old version:

    bin/idemponit -b input.html

Idemponit will read all of the fixup routines from the nits/ directory, applying each one to the input before serializing the output as well-formed HTML5.

If you want to have your own set of fixup routines, put .js files in ~/.idemponit

Pass in more directories (perhaps document-specific) with --nitdir on the command line.

### rfcq Usage
To test out a jQuery selector, or to retrieve meta-data from a document, use bin/rfcq:

	bin/rfcq '$(".author .surname").first().text()' docs/draft-hildebrand-html-rfc.html

### License
This code is licensed under the [Apache Software License, 2.0](http://www.apache.org/licenses/LICENSE-2.0)
