#!/bin/bash
set -e

if [ $# -ne 1 ]; then
    echo "Usage: $0 <outputdir>"
    exit -1
fi

outputdir="$1"
[ -d "$outputdir" ] && rm -r "$outputdir"/*
mkdir -p "$outputdir"

run_test() {
    run_test_that_should_pass "$@"
}

run_test_that_should_pass() {
    local testname="$(basename $1)"
    local out="$outputdir/$testname"
    mkdir -p "$out"

    set +e
    node src/main/javascript --nitdir "$1/nits" "$1/input.html" "$out/results" >"$out/stdout" 2>"$out/stderr"
    set -e
    
    if [ $(cat "$out/stdout" | wc -c) -ne 0 ]; then
        echo "FAILURE: expected nothing on stdout. Got:"
        cat "$out/stdout"
        return -1
    fi

    if [ ! -e "$out/results" ]; then
        echo "FAILURE: no output file present at $out/results"
        return -2
    fi

    diff "$1/expected-output.html" "$out/results"
    return $?
}

failures=()
dirname="$(dirname $0)"
for test in "$dirname"/*/; do
    run_test "$test" || failures[${#failures[@]}]="$(basename $test)"
done

if [ ${#failures[@]} -ne 0 ]; then
    echo "$((${#failures[@]})) tests failed! Failures: ${failures[@]}"
fi