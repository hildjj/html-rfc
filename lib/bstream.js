function BufStream() {
    this.bufs = [];
}

BufStream.prototype.write = function(buf) {
    if (typeof(buf) === 'string') {
        buf = new Buffer(buf);
    }
    this.bufs.push(buf);
};

BufStream.prototype.toString = function() {
    var buf = this.buffer();
    return buf.toString.apply(buf, arguments);
}

BufStream.prototype.buffer = function() {
    switch (this.bufs.length) {
        case 0:
            return new Buffer(0);
        case 1:
            return this.bufs[0];
        default:
            break;
    }
    var len = this.bufs.reduce(function(prev,cur) {
        return prev + cur.length;
    }, 0);
    var buf = new Buffer(len);
    this.bufs.reduce(function(prev,cur) {
        cur.copy(buf, prev);
        return prev + cur.length;
    }, 0);
    return buf;
};

module.exports = BufStream;
