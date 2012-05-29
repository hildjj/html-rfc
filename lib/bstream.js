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

// cb(er, flatbuf)
BufStream.prototype.readStream = function(s, cb) {
    var that = this;
    s.on('data', function(chunk) {
        that.write(chunk);
    });
    s.on('error', function(er) {
        if (cb) {
            cb.call(that, er);
        }
    });
    s.on('end', function() {
        if (cb) {
            cb.call(that, null, that.buffer());
        }
    });
}

module.exports = BufStream;
