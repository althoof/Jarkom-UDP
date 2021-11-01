var udp = require('../')
var ip = require('ip-packet')
var xtend = require('xtend')
var test = require('tape')

/* gathered with: sudo tcpdump -X -i wlan0
18:40:14.449294 IP 104.131.0.235.60001 > 10.0.0.109.58078: UDP, length 72
        0x0000:  4522 0064 4971 0000 3311 ca1b 6883 00eb  E".dIq..3...h...
        0x0010:  0a00 006d ea61 e2de 0050 d520 8000 0000  ...m.a...P......
        0x0020:  0004 4181 c6e0 46ba fdc6 8722 10d7 ebda  ..A...F...."....
        0x0030:  d74f 6245 ac6b ce7e 6a8d 4dbc d257 3276  .ObE.k.~j.M..W2v
        0x0040:  cfa0 de22 38f7 e0d8 ee6e e0a1 e8b3 3e29  ..."8....n....>)
        0x0050:  6e08 9a4a ad6e 51ed 0bf6 13ff d824 bfba  n..J.nQ......$..
        0x0060:  a40b 05ad                                ....
*/
var data = Buffer.from([
  // 20 bytes of IP header:
  0x45, 0x22, 0x00, 0x64, 0x49, 0x71, 0x00, 0x00,
  0x33, 0x11, 0xca, 0x1b, 0x68, 0x83, 0x00, 0xeb,
  0x0a, 0x00, 0x00, 0x6d,
  // UDP data:
  0xea, 0x61, 0xe2, 0xde, 0x00, 0x50, 0xd5, 0x20, 0x80, 0x00, 0x00, 0x00, 0x00,
  0x04, 0x41, 0x81, 0xc6, 0xe0, 0x46, 0xba, 0xfd, 0xc6, 0x87, 0x22, 0x10, 0xd7,
  0xeb, 0xda, 0xd7, 0x4f, 0x62, 0x45, 0xac, 0x6b, 0xce, 0x7e, 0x6a, 0x8d, 0x4d,
  0xbc, 0xd2, 0x57, 0x32, 0x76, 0xcf, 0xa0, 0xde, 0x22, 0x38, 0xf7, 0xe0, 0xd8,
  0xee, 0x6e, 0xe0, 0xa1, 0xe8, 0xb3, 0x3e, 0x29, 0x6e, 0x08, 0x9a, 0x4a, 0xad,
  0x6e, 0x51, 0xed, 0x0b, 0xf6, 0x13, 0xff, 0xd8, 0x24, 0xbf, 0xba, 0xa4, 0x0b,
  0x05, 0xad
])

test('decode a real packet', function (t) {
  var packet = udp.decode(data.slice(20))
  t.equal(packet.sourcePort, 60001)
  t.equal(packet.destinationPort, 58078)
  t.equal(packet.length, 72 + 8)
  t.end()
})

test('verify checksum from real packet', function (t) {
  var ipPacket = ip.decode(data)
  var udpPacket = udp.decode(ipPacket.data)

  t.equal(
    udp.checksum(xtend(ipPacket, udpPacket), ipPacket.data),
    udpPacket.checksum
  )
  t.end()
})
