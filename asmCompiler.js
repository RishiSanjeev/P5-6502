function asmCompiler(asm) {
    function syntaxCheck(memLoc) {
        var char = memLoc[0]
        binary = hex = decimal = false
        if (char == "%") {
            binary = true
        } else if (char == "$") {
            hex = true
        } else {
            decimal = true
        }
    }

    function baseConverter(memLoc) {
        syntaxCheck(memLoc)
        if (binary) {
            return parseInt(memLoc.substring(1, memLoc.length), 2)
        } else if (hex) {
            return parseInt(memLoc.substring(1, memLoc.length), 16)
        } else {
            return parseInt(memLoc)
        }
    }

    function addressing_mode(memLoc, instruction) {
        memLoc = memLoc.toLowerCase()
        immediate = false, accumulatorMode = false, absolute = false, absoluteX = false, absoluteY = false, implied = false, indirect = false, indirectX = false, indirectY = false, relative = false, zeroPageMode = false, zeroPageX = false, zeroPageY = false
        if (memLoc[0] == "#") {
            immediate = true
        } else if (memLoc[0].toUpperCase() === "A" || memLoc[0] == undefined) {
            accumulatorMode = true
        } else if (memLoc.includes(",x")) {
            absoluteX = true
        } else if (memLoc.includes(",y")) {
            absoluteY = true
        } else if (impliedList.includes(instruction)) {
            implied = true
        } else if (memLoc[0] == "(" && memLoc[memLoc.length-1] == ")") {
            if (memLoc.includes(",x")) {
                indirectX = true
            } else if (memLoc.includes(",y")) {
                indirectY = true
            } else {
                indirect = true
            }
        } else if (relativeList.includes(instruction)) {
            relative = true
        } else if (zeroPageList.includes(instruction) && baseConverter(memLoc) <= 255) {
            zeroPageMode = true
        } else if (zeroPageList.includes(instruction) && memLoc.includes(",x") && baseConverter(memLoc.substring(0, memLoc.length - 2)) <= 255) {
            zeroPageX = true
        } else if (zeroPageList.includes(instruction) && memLoc.includes(",y") && baseConverter(memLoc.substring(0, memLoc.length - 2)) <= 255) {
            zeroPageY = true
        } else {
            absolute = true
        }
    }
    function addrVal(memLoc) {
        return parseInt(memory.slice(memLoc*8,(memLoc+1)*8).join(''),2)
    }
    function adc(param) {
        addressing_mode(param, "adc")
        let accVal = parseInt(accumulator.join(''), 2)
        let m

        if (immediate) {
            m = baseConverter(param.substring(1))
        } else if (absolute || zeroPageMode) {
            m = addrVal(baseConverter(param))
        } else if (absoluteX || zeroPageX) {
            let addr = (baseConverter(param.split(",")[0]) + parseInt(x.join(''), 2)) & 0xFFFF
            m = addrVal(addr)
        } else if (absoluteY) {
            let addr = (baseConverter(param.split(",")[0]) + parseInt(y.join(''), 2)) & 0xFFFF
            m = addrVal(addr)
        } else if (indirectY) {
            let yVal = parseInt(y.join(''), 2)
            let zAdd = baseConverter(param.split('(')[1].split(')')[0])
            let lo = addrVal(zAdd)
            let hi = addrVal((zAdd + 1) & 0xFF)
            let location = (((hi << 8) | lo) + yVal) & 0xFFFF
            m = addrVal(location)
        } else if (indirectX) {
            let xVal = parseInt(x.join(''), 2)
            let zAdd = baseConverter(param.split('(')[1].split(',')[0])
            let lo = addrVal((zAdd + xVal) & 0xFF)
            let hi = addrVal((zAdd + xVal + 1) & 0xFF)
            let location = ((hi << 8) | lo) & 0xFFFF
            m = addrVal(location)
        }

        let result = accVal + m + carry
        carry = result > 0xFF ? 1 : 0
        result = result & 0xFF
        overflow = ((~(accVal ^ m) & (accVal ^ result)) & 0x80) ? 1 : 0

        accumulator = result.toString(2).padStart(8, "0").split("")
        zero = (result === 0) ? 1 : 0
        negative = (result & 0x80) ? 1 : 0
    }
    function and(param) {
        addressing_mode(param, "and")
        let accVal = parseInt(accumulator.join(''), 2)
        let m

        if (immediate) {
            m = baseConverter(param.substring(1))
        } else if (absolute || zeroPageMode) {
            m = addrVal(baseConverter(param))
        } else if (absoluteX || zeroPageX) {
            let addr = (baseConverter(param.split(",")[0]) + parseInt(x.join(''), 2)) & 0xFFFF
            m = addrVal(addr)
        } else if (absoluteY) {
            let addr = (baseConverter(param.split(",")[0]) + parseInt(y.join(''), 2)) & 0xFFFF
            m = addrVal(addr)
        } else if (indirectY) {
            let yVal = parseInt(y.join(''), 2)
            let zAdd = baseConverter(param.split('(')[1].split(')')[0])
            let lo = addrVal(zAdd)
            let hi = addrVal((zAdd + 1) & 0xFF)
            let location = ((hi << 8) | lo) + yVal
            m = addrVal(location)
        } else if (indirectX) {
            let xVal = parseInt(x.join(''), 2)
            let zAdd = baseConverter(param.split('(')[1].split(',')[0])
            let lo = addrVal((zAdd + xVal) & 0xFF)
            let hi = addrVal((zAdd + xVal + 1) & 0xFF)
            let location = (hi << 8) | lo
            m = addrVal(location)
        }

        let result = accVal & m
        accumulator = result.toString(2).padStart(8, "0").split("")
        zero = (result === 0) ? 1 : 0
        negative = (result & 0x80) ? 1 : 0
    }
    function ora(param) {
        addressing_mode(param, "ora")
        let accVal = parseInt(accumulator.join(''), 2)
        let m

        if (immediate) {
            m = baseConverter(param.substring(1))
        } else if (absolute || zeroPageMode) {
            m = addrVal(baseConverter(param))
        } else if (absoluteX || zeroPageX) {
            let addr = (baseConverter(param.split(",")[0]) + parseInt(x.join(''), 2)) & 0xFFFF
            m = addrVal(addr)
        } else if (absoluteY) {
            let addr = (baseConverter(param.split(",")[0]) + parseInt(y.join(''), 2)) & 0xFFFF
            m = addrVal(addr)
        } else if (indirectY) {
            let yVal = parseInt(y.join(''), 2)
            let zAdd = baseConverter(param.split('(')[1].split(')')[0])
            let lo = addrVal(zAdd)
            let hi = addrVal((zAdd + 1) & 0xFF)
            let location = ((hi << 8) | lo) + yVal
            m = addrVal(location)
        } else if (indirectX) {
            let xVal = parseInt(x.join(''), 2)
            let zAdd = baseConverter(param.split('(')[1].split(',')[0])
            let lo = addrVal((zAdd + xVal) & 0xFF)
            let hi = addrVal((zAdd + xVal + 1) & 0xFF)
            let location = (hi << 8) | lo
            m = addrVal(location)
        }

        let result = accVal | m
        accumulator = result.toString(2).padStart(8, "0").split("")
        zero = (result === 0) ? 1 : 0
        negative = (result & 0x80) ? 1 : 0
    }
    function eor(param) {
        addressing_mode(param, "eor")
        let accVal = parseInt(accumulator.join(''), 2)
        let m

        if (immediate) {
            m = baseConverter(param.substring(1))
        } else if (absolute || zeroPageMode) {
            m = addrVal(baseConverter(param))
        } else if (absoluteX || zeroPageX) {
            let addr = (baseConverter(param.split(",")[0]) + parseInt(x.join(''), 2)) & 0xFFFF
            m = addrVal(addr)
        } else if (absoluteY) {
            let addr = (baseConverter(param.split(",")[0]) + parseInt(y.join(''), 2)) & 0xFFFF
            m = addrVal(addr)
        } else if (indirectY) {
            let yVal = parseInt(y.join(''), 2)
            let zAdd = baseConverter(param.split('(')[1].split(')')[0])
            let lo = addrVal(zAdd)
            let hi = addrVal((zAdd + 1) & 0xFF)
            let location = ((hi << 8) | lo) + yVal
            m = addrVal(location)
        } else if (indirectX) {
            let xVal = parseInt(x.join(''), 2)
            let zAdd = baseConverter(param.split('(')[1].split(',')[0])
            let lo = addrVal((zAdd + xVal) & 0xFF)
            let hi = addrVal((zAdd + xVal + 1) & 0xFF)
            let location = (hi << 8) | lo
            m = addrVal(location)
        }

        let result = accVal ^ m
        accumulator = result.toString(2).padStart(8, "0").split("")
        zero = (result === 0) ? 1 : 0
        negative = (result & 0x80) ? 1 : 0
    }
    function sbc(param) {
        addressing_mode(param, "sbc")
        let accVal = parseInt(accumulator.join(''), 2)
        let m

        if (immediate) {
            m = baseConverter(param.substring(1))
        } else if (absolute || zeroPageMode) {
            m = addrVal(baseConverter(param))
        } else if (absoluteX || zeroPageX) {
            let addr = (baseConverter(param.split(",")[0]) + parseInt(x.join(''), 2)) & 0xFFFF
            m = addrVal(addr)
        } else if (absoluteY) {
            let addr = (baseConverter(param.split(",")[0]) + parseInt(y.join(''), 2)) & 0xFFFF
            m = addrVal(addr)
        } else if (indirectY) {
            let yVal = parseInt(y.join(''), 2)
            let zAdd = baseConverter(param.split('(')[1].split(')')[0])
            let lo = addrVal(zAdd)
            let hi = addrVal((zAdd + 1) & 0xFF)
            let location = ((hi << 8) | lo) + yVal
            m = addrVal(location)
        } else if (indirectX) {
            let xVal = parseInt(x.join(''), 2)
            let zAdd = baseConverter(param.split('(')[1].split(',')[0])
            let lo = addrVal((zAdd + xVal) & 0xFF)
            let hi = addrVal((zAdd + xVal + 1) & 0xFF)
            let location = (hi << 8) | lo
            m = addrVal(location)
        }

        let borrow = (carry === 1) ? 0 : 1
        let rawResult = accVal - m - borrow
        carry = rawResult >= 0 ? 1 : 0
        let result = rawResult & 0xFF
        overflow = (((accVal ^ rawResult) & (accVal ^ m)) & 0x80) ? 1 : 0

        accumulator = result.toString(2).padStart(8, "0").split("")
        zero = (result === 0) ? 1 : 0
        negative = (result & 0x80) ? 1 : 0
    }
    function bit(param) {
        addressing_mode(param, "bit")
        let m
        if (absolute || zeroPageMode) {
            m = addrVal(baseConverter(param))
        } else if (absoluteX || zeroPageX) {
            let addr = (baseConverter(param.split(",")[0]) + parseInt(x.join(""), 2)) & 0xFFFF
            m = addrVal(addr)
        } else if (absoluteY || zeroPageY) {
            let addr = (baseConverter(param.split(",")[0]) + parseInt(y.join(""), 2)) & 0xFFFF
            m = addrVal(addr)
        } else if (indirectY) {
            let yVal = parseInt(y.join(""), 2)
            let zAdd = baseConverter(param.split("(")[1].split(")")[0])
            let lo = addrVal(zAdd)
            let hi = addrVal((zAdd + 1) & 0xFF)
            let location = ((hi << 8) | lo) + yVal
            m = addrVal(location)
        } else if (indirectX) {
            let xVal = parseInt(x.join(""), 2)
            let zAdd = baseConverter(param.split("(")[1].split(",")[0])
            let lo = addrVal((zAdd + xVal) & 0xFF)
            let hi = addrVal((zAdd + xVal + 1) & 0xFF)
            let location = (hi << 8) | lo
            m = addrVal(location)
        }

        let accVal = parseInt(accumulator.join(""), 2)
        zero = ((accVal & m) === 0) ? 1 : 0
        negative = (m & 0x80) ? 1 : 0
        overflow = (m & 0x40) ? 1 : 0
    }
    function cmp(param) {
        addressing_mode(param, "cmp")
        let accVal = parseInt(accumulator.join(""), 2)
        let m

        if (immediate) {
            m = baseConverter(param.substring(1))
        } else if (absolute || zeroPageMode) {
            m = addrVal(baseConverter(param))
        } else if (absoluteX || zeroPageX) {
            let addr = (baseConverter(param.split(",")[0]) + parseInt(x.join(""), 2)) & 0xFFFF
            m = addrVal(addr)
        } else if (absoluteY) {
            let addr = (baseConverter(param.split(",")[0]) + parseInt(y.join(""), 2)) & 0xFFFF
            m = addrVal(addr)
        } else if (indirectY) {
            let yVal = parseInt(y.join(""), 2)
            let zAdd = baseConverter(param.split('(')[1].split(')')[0])
            let lo = addrVal(zAdd)
            let hi = addrVal((zAdd + 1) & 0xFF)
            let location = ((hi << 8) | lo) + yVal
            m = addrVal(location)
        } else if (indirectX) {
            let xVal = parseInt(x.join(""), 2)
            let zAdd = baseConverter(param.split('(')[1].split(',')[0])
            let lo = addrVal((zAdd + xVal) & 0xFF)
            let hi = addrVal((zAdd + xVal + 1) & 0xFF)
            let location = (hi << 8) | lo
            m = addrVal(location)
        }

        let diff = accVal - m
        carry = (accVal >= m) ? 1 : 0
        let result = diff & 0xFF
        zero = (result === 0) ? 1 : 0
        negative = (result & 0x80) ? 1 : 0
    }
    function cpx(param) {
        addressing_mode(param, "cpx")
        let xVal = parseInt(x.join(""), 2)
        let m

        if (immediate) {
            m = baseConverter(param.substring(1))
        } else if (absolute || zeroPageMode) {
            m = addrVal(baseConverter(param))
        } else if (absoluteX || zeroPageX) {
            let addr = (baseConverter(param.split(",")[0]) + parseInt(x.join(""), 2)) & 0xFFFF
            m = addrVal(addr)
        } else if (absoluteY) {
            let addr = (baseConverter(param.split(",")[0]) + parseInt(y.join(""), 2)) & 0xFFFF
            m = addrVal(addr)
        } else if (indirectY) {
            let yVal = parseInt(y.join(""), 2)
            let zAdd = baseConverter(param.split('(')[1].split(')')[0])
            let lo = addrVal(zAdd)
            let hi = addrVal((zAdd + 1) & 0xFF)
            let location = ((hi << 8) | lo) + yVal
            m = addrVal(location)
        } else if (indirectX) {
            let xVal2 = parseInt(x.join(""), 2)
            let zAdd = baseConverter(param.split('(')[1].split(',')[0])
            let lo = addrVal((zAdd + xVal2) & 0xFF)
            let hi = addrVal((zAdd + xVal2 + 1) & 0xFF)
            let location = (hi << 8) | lo
            m = addrVal(location)
        }

        let diff = xVal - m
        carry = (xVal >= m) ? 1 : 0
        let result = diff & 0xFF
        zero = (result === 0) ? 1 : 0
        negative = (result & 0x80) ? 1 : 0
    }
    function cpy(param) {
        addressing_mode(param, "cpy")
        let yVal2 = parseInt(y.join(""), 2)
        let m

        if (immediate) {
            m = baseConverter(param.substring(1))
        } else if (absolute || zeroPageMode) {
            m = addrVal(baseConverter(param))
        } else if (absoluteX || zeroPageX) {
            let addr = (baseConverter(param.split(",")[0]) + parseInt(x.join(""), 2)) & 0xFFFF
            m = addrVal(addr)
        } else if (absoluteY) {
            let addr = (baseConverter(param.split(",")[0]) + parseInt(y.join(""), 2)) & 0xFFFF
            m = addrVal(addr)
        } else if (indirectY) {
            let yVal = parseInt(y.join(""), 2)
            let zAdd = baseConverter(param.split('(')[1].split(')')[0])
            let lo = addrVal(zAdd)
            let hi = addrVal((zAdd + 1) & 0xFF)
            let location = ((hi << 8) | lo) + yVal
            m = addrVal(location)
        } else if (indirectX) {
            let xVal3 = parseInt(x.join(""), 2)
            let zAdd = baseConverter(param.split('(')[1].split(',')[0])
            let lo = addrVal((zAdd + xVal3) & 0xFF)
            let hi = addrVal((zAdd + xVal3 + 1) & 0xFF)
            let location = (hi << 8) | lo
            m = addrVal(location)
        }

        let diff = yVal2 - m
        carry = (yVal2 >= m) ? 1 : 0
        let result = diff & 0xFF
        zero = (result === 0) ? 1 : 0
        negative = (result & 0x80) ? 1 : 0
    }
    function dec(param) {
        addressing_mode(param, "dec")
        let addr

        if (absolute) {
            addr = baseConverter(param)
        } else if (absoluteX) {
            addr = (baseConverter(param.split(",")[0]) + parseInt(x.join(""), 2)) & 0xFFFF
        } else if (absoluteY) {
            addr = (baseConverter(param.split(",")[0]) + parseInt(y.join(""), 2)) & 0xFFFF
        } else if (zeroPageMode) {
            addr = baseConverter(param)
        } else if (zeroPageX) {
            addr = (baseConverter(param.split(",")[0]) + parseInt(x.join(""), 2)) & 0xFF
        } else if (zeroPageY) {
            addr = (baseConverter(param.split(",")[0]) + parseInt(y.join(""), 2)) & 0xFF
        } else {
            return
        }

        let byteVal = addrVal(addr)
        let newVal = (byteVal - 1) & 0xFF
        let binStr = newVal.toString(2).padStart(8, "0")
        for (let i = 0; i < 8; i++) {
            memory[addr * 8 + i] = binStr[i]
        }
        zero = (newVal === 0) ? 1 : 0
        negative = (newVal & 0x80) ? 1 : 0
    }
    function inc(param) {
        addressing_mode(param, "inc")
        let addr

        if (absolute) {
            addr = baseConverter(param)
        } else if (absoluteX) {
            addr = (baseConverter(param.split(",")[0]) + parseInt(x.join(""), 2)) & 0xFFFF
        } else if (absoluteY) {
            addr = (baseConverter(param.split(",")[0]) + parseInt(y.join(""), 2)) & 0xFFFF
        } else if (zeroPageMode) {
            addr = baseConverter(param)
        } else if (zeroPageX) {
            addr = (baseConverter(param.split(",")[0]) + parseInt(x.join(""), 2)) & 0xFF
        } else if (zeroPageY) {
            addr = (baseConverter(param.split(",")[0]) + parseInt(y.join(""), 2)) & 0xFF
        } else {
            return
        }

        let byteVal = addrVal(addr)
        let newVal = (byteVal + 1) & 0xFF
        let binStr = newVal.toString(2).padStart(8, "0")
        for (let i = 0; i < 8; i++) {
            memory[addr * 8 + i] = binStr[i]
        }
        zero = (newVal === 0) ? 1 : 0
        negative = (newVal & 0x80) ? 1 : 0
    }
    function asl(param) {
        addressing_mode(param, "asl")

        if (accumulatorMode) {
            let accVal = parseInt(accumulator.join(""), 2)
            carry = (accVal & 0x80) >> 7
            let newVal = (accVal << 1) & 0xFF
            accumulator = newVal.toString(2).padStart(8, "0").split("")
            zero = (newVal === 0) ? 1 : 0
            negative = (newVal & 0x80) ? 1 : 0
        } else {
            let addr

            if (absolute) {
                addr = baseConverter(param)
            } else if (absoluteX) {
                addr = (baseConverter(param.split(",")[0]) + parseInt(x.join(""), 2)) & 0xFFFF
            } else if (absoluteY) {
                addr = (baseConverter(param.split(",")[0]) + parseInt(y.join(""), 2)) & 0xFFFF
            } else if (zeroPageMode) {
                addr = baseConverter(param)
            } else if (zeroPageX) {
                addr = (baseConverter(param.split(",")[0]) + parseInt(x.join(""), 2)) & 0xFF
            } else if (zeroPageY) {
                addr = (baseConverter(param.split(",")[0]) + parseInt(y.join(""), 2)) & 0xFF
            } else {
                return
            }

            let byteVal = addrVal(addr)
            carry = (byteVal & 0x80) >> 7
            let newVal = (byteVal << 1) & 0xFF
            let binStr = newVal.toString(2).padStart(8, "0")
            for (let i = 0; i < 8; i++) {
                memory[addr * 8 + i] = binStr[i]
            }
            zero = (newVal === 0) ? 1 : 0
            negative = (newVal & 0x80) ? 1 : 0
        }
    }
    function lsr(param) {
        addressing_mode(param, "lsr")

        if (accumulatorMode) {
            let accVal = parseInt(accumulator.join(""), 2)
            carry = accVal & 0x01
            let newVal = (accVal >> 1) & 0xFF
            accumulator = newVal.toString(2).padStart(8, "0").split("")
            zero = (newVal === 0) ? 1 : 0
            negative = 0
        } else {
            let addr

            if (absolute) {
                addr = baseConverter(param)
            } else if (absoluteX) {
                addr = (baseConverter(param.split(",")[0]) + parseInt(x.join(""), 2)) & 0xFFFF
            } else if (absoluteY) {
                addr = (baseConverter(param.split(",")[0]) + parseInt(y.join(""), 2)) & 0xFFFF
            } else if (zeroPageMode) {
                addr = baseConverter(param)
            } else if (zeroPageX) {
                addr = (baseConverter(param.split(",")[0]) + parseInt(x.join(""), 2)) & 0xFF
            } else if (zeroPageY) {
                addr = (baseConverter(param.split(",")[0]) + parseInt(y.join(""), 2)) & 0xFF
            } else {
                return
            }

            let byteVal = addrVal(addr)
            carry = byteVal & 0x01
            let newVal = (byteVal >> 1) & 0xFF
            let binStr = newVal.toString(2).padStart(8, "0")
            for (let i = 0; i < 8; i++) {
                memory[addr * 8 + i] = binStr[i]
            }
            zero = (newVal === 0) ? 1 : 0
            negative = 0
        }
    }
    function rol(param) {
        addressing_mode(param, "rol")

        if (accumulatorMode) {
            let accVal = parseInt(accumulator.join(""), 2)
            let newCarry = (accVal & 0x80) >> 7
            let newVal = ((accVal << 1) | carry) & 0xFF
            carry = newCarry
            accumulator = newVal.toString(2).padStart(8, "0").split("")
            zero = (newVal === 0) ? 1 : 0
            negative = (newVal & 0x80) ? 1 : 0
        } else {
            let addr

            if (absolute) {
                addr = baseConverter(param)
            } else if (absoluteX) {
                addr = (baseConverter(param.split(",")[0]) + parseInt(x.join(""), 2)) & 0xFFFF
            } else if (absoluteY) {
                addr = (baseConverter(param.split(",")[0]) + parseInt(y.join(""), 2)) & 0xFFFF
            } else if (zeroPageMode) {
                addr = baseConverter(param)
            } else if (zeroPageX) {
                addr = (baseConverter(param.split(",")[0]) + parseInt(x.join(""), 2)) & 0xFF
            } else if (zeroPageY) {
                addr = (baseConverter(param.split(",")[0]) + parseInt(y.join(""), 2)) & 0xFF
            } else {
                return
            }

            let byteVal = addrVal(addr)
            let newCarry = (byteVal & 0x80) >> 7
            let newVal = ((byteVal << 1) | carry) & 0xFF
            carry = newCarry
            let binStr = newVal.toString(2).padStart(8, "0")
            for (let i = 0; i < 8; i++) {
                memory[addr * 8 + i] = binStr[i]
            }
            zero = (newVal === 0) ? 1 : 0
            negative = (newVal & 0x80) ? 1 : 0
        }
    }
    function ror(param) {
        addressing_mode(param, "ror")

        if (accumulatorMode) {
            let accVal = parseInt(accumulator.join(""), 2)
            let newCarry = accVal & 0x01
            let newVal = ((carry << 7) | (accVal >> 1)) & 0xFF
            carry = newCarry
            accumulator = newVal.toString(2).padStart(8, "0").split("")
            zero = (newVal === 0) ? 1 : 0
            negative = (newVal & 0x80) ? 1 : 0
        } else {
            let addr

            if (absolute) {
                addr = baseConverter(param)
            } else if (absoluteX) {
                addr = (baseConverter(param.split(",")[0]) + parseInt(x.join(""), 2)) & 0xFFFF
            } else if (absoluteY) {
                addr = (baseConverter(param.split(",")[0]) + parseInt(y.join(""), 2)) & 0xFFFF
            } else if (zeroPageMode) {
                addr = baseConverter(param)
            } else if (zeroPageX) {
                addr = (baseConverter(param.split(",")[0]) + parseInt(x.join(""), 2)) & 0xFF
            } else if (zeroPageY) {
                addr = (baseConverter(param.split(",")[0]) + parseInt(y.join(""), 2)) & 0xFF
            } else {
                return
            }

            let byteVal = addrVal(addr)
            let newCarry = byteVal & 0x01
            let newVal = ((carry << 7) | (byteVal >> 1)) & 0xFF
            carry = newCarry
            let binStr = newVal.toString(2).padStart(8, "0")
            for (let i = 0; i < 8; i++) {
                memory[addr * 8 + i] = binStr[i]
            }
            zero = (newVal === 0) ? 1 : 0
            negative = (newVal & 0x80) ? 1 : 0
        }
    }

    function sta(param) {
        addressing_mode(param, "sta")
        let addr
        if (absolute) {
            addr = baseConverter(param)
        } else if (absoluteX) {
            addr = (baseConverter(param.split(",")[0]) + parseInt(x.join(""), 2)) & 0xFFFF
        } else if (absoluteY) {
            addr = (baseConverter(param.split(",")[0]) + parseInt(y.join(""), 2)) & 0xFFFF
        } else if (zeroPageMode) {
            addr = baseConverter(param)
        } else if (zeroPageX) {
            addr = (baseConverter(param.split(",")[0]) + parseInt(x.join(""), 2)) & 0xFF
        } else if (zeroPageY) {
            addr = (baseConverter(param.split(",")[0]) + parseInt(y.join(""), 2)) & 0xFF
        } else {
            return
        }
        let aVal = parseInt(accumulator.join(""), 2)
        let binStr = aVal.toString(2).padStart(8, "0")
        for (let i = 0; i < 8; i++) {
            memory[addr * 8 + i] = binStr[i]
        }
    }

    function stx(param) {
        addressing_mode(param, "stx")
        let addr
        if (absolute) {
            addr = baseConverter(param)
        } else if (absoluteX) {
            addr = (baseConverter(param.split(",")[0]) + parseInt(x.join(""), 2)) & 0xFFFF
        } else if (absoluteY) {
            addr = (baseConverter(param.split(",")[0]) + parseInt(y.join(""), 2)) & 0xFFFF
        } else if (zeroPageMode) {
            addr = baseConverter(param)
        } else if (zeroPageX) {
            addr = (baseConverter(param.split(",")[0]) + parseInt(x.join(""), 2)) & 0xFF
        } else if (zeroPageY) {
            addr = (baseConverter(param.split(",")[0]) + parseInt(y.join(""), 2)) & 0xFF
        } else {
            return
        }
        let xVal = parseInt(x.join(""), 2)
        let binStr = xVal.toString(2).padStart(8, "0")
        for (let i = 0; i < 8; i++) {
            memory[addr * 8 + i] = binStr[i]
        }
    }

    function sty(param) {
        addressing_mode(param, "sty")
        let addr
        if (absolute) {
            addr = baseConverter(param)
        } else if (absoluteX) {
            addr = (baseConverter(param.split(",")[0]) + parseInt(x.join(""), 2)) & 0xFFFF
        } else if (absoluteY) {
            addr = (baseConverter(param.split(",")[0]) + parseInt(y.join(""), 2)) & 0xFFFF
        } else if (zeroPageMode) {
            addr = baseConverter(param)
        } else if (zeroPageX) {
            addr = (baseConverter(param.split(",")[0]) + parseInt(x.join(""), 2)) & 0xFF
        } else if (zeroPageY) {
            addr = (baseConverter(param.split(",")[0]) + parseInt(y.join(""), 2)) & 0xFF
        } else {
            return
        }
        let yVal2 = parseInt(y.join(""), 2)
        let binStr = yVal2.toString(2).padStart(8, "0")
        for (let i = 0; i < 8; i++) {
            memory[addr * 8 + i] = binStr[i]
        }
    }
    function pha() {
        let spVal = parseInt(sp.join(''), 2)
        let addr = 0x0100 + spVal
        for (let i = 0; i < 8; i++) {
            memory[addr * 8 + i] = accumulator[i]
        }
        spVal = (spVal - 1) & 0xFF
        sp = spVal.toString(2).padStart(8, "0").split('')
    }
    function php() {
        function pushByte(value) {
            let spVal2 = parseInt(sp.join(""), 2)
            let addr2 = 0x0100 + spVal2
            let binStr2 = value.toString(2).padStart(8, "0")
            for (let i = 0; i < 8; i++) {
                memory[(addr2 * 8) + i] = binStr2[i]
            }
            spVal2 = (spVal2 - 1) & 0xFF
            sp = spVal2.toString(2).padStart(8, "0").split("")
        }
        let statusByte =
            (negative << 7)      |
            (overflow << 6)      |
            (1 << 5)             |
            (1 << 4)             |
            (decimal_mode << 3)  |
            (interrupt_disable << 2) |
            (zero << 1)          |
            carry
        pushByte(statusByte)
    }
    function pla() {
        let spVal = (parseInt(sp.join(""), 2) + 1) & 0xFF
        sp = spVal.toString(2).padStart(8, "0").split("")
        let addr = 0x0100 + spVal
        let bits = memory.slice(addr * 8, (addr + 1) * 8).join("")
        let pulled = parseInt(bits, 2)
        accumulator = pulled.toString(2).padStart(8, "0").split("")
        zero = (pulled === 0) ? 1 : 0
        negative = (pulled & 0x80) ? 1 : 0
    }
    function plp() {
        let spVal = (parseInt(sp.join(""), 2) + 1) & 0xFF
        sp = spVal.toString(2).padStart(8, "0").split("")
        let addr = 0x0100 + spVal
        let bits = memory.slice(addr * 8, (addr + 1) * 8).join("")
        let statusByte = parseInt(bits, 2)
        negative          = (statusByte & 0x80) ? 1 : 0
        overflow          = (statusByte & 0x40) ? 1 : 0
        break_command     = (statusByte & 0x10) ? 1 : 0
        decimal_mode      = (statusByte & 0x08) ? 1 : 0
        interrupt_disable = (statusByte & 0x04) ? 1 : 0
        zero              = (statusByte & 0x02) ? 1 : 0
        carry             = (statusByte & 0x01) ? 1 : 0
    }
    function jmp(param) {
        addressing_mode(param, "jmp")
        if (absolute) {
            pc = baseConverter(param) & 0xFFFF
        } else if (indirect) {
            let zAdd = baseConverter(param.substring(1, param.length - 1))
            let lo = addrVal(zAdd & 0xFF)
            let hi = addrVal((zAdd + 1) & 0xFF)
            pc = ((hi << 8) | lo) & 0xFFFF
        }
    }
    function jsr(param) {
        addressing_mode(param, "jsr")
        function pushByte(value) {
            let spVal3 = parseInt(sp.join(""), 2)
            let addr3 = 0x0100 + spVal3
            let binStr3 = value.toString(2).padStart(8, "0")
            for (let i = 0; i < 8; i++) {
                memory[(addr3 * 8) + i] = binStr3[i]
            }
            spVal3 = (spVal3 - 1) & 0xFF
            sp = spVal3.toString(2).padStart(8, "0").split("")
        }
        let returnAddr = (pc - 1) & 0xFFFF
        let hiByte = (returnAddr >> 8) & 0xFF
        let loByte = returnAddr & 0xFF
        pushByte(hiByte)
        pushByte(loByte)
        if (absolute) {
            pc = baseConverter(param) & 0xFFFF
        }
    }
    function rts() {
        function pullByte() {
            let spVal4 = (parseInt(sp.join(""), 2) + 1) & 0xFF
            sp = spVal4.toString(2).padStart(8, "0").split("")
            let addr4 = 0x0100 + spVal4
            let bits4 = memory.slice(addr4 * 8, (addr4 + 1) * 8).join("")
            return parseInt(bits4, 2)
        }
        let lo = pullByte()
        let hi = pullByte()
        let ret = ((hi << 8) | lo) & 0xFFFF
        pc = (ret + 1) & 0xFFFF
    }
    function rti() {
        function pullByte() {
            let spVal5 = (parseInt(sp.join(""), 2) + 1) & 0xFF
            sp = spVal5.toString(2).padStart(8, "0").split("")
            let addr5 = 0x0100 + spVal5
            let bits5 = memory.slice(addr5 * 8, (addr5 + 1) * 8).join("")
            return parseInt(bits5, 2)
        }
        plp()
        let lo = pullByte()
        let hi = pullByte()
        pc = ((hi << 8) | lo) & 0xFFFF
    }
    function brk() {
        function pushByte(value) {
            let spVal6 = parseInt(sp.join(""), 2)
            let addr6 = 0x0100 + spVal6
            let binStr6 = value.toString(2).padStart(8, "0")
            for (let i = 0; i < 8; i++) {
                memory[(addr6 * 8) + i] = binStr6[i]
            }
            spVal6 = (spVal6 - 1) & 0xFF
            sp = spVal6.toString(2).padStart(8, "0").split("")
        }
        let returnAddr = (pc + 1) & 0xFFFF
        let hiByte = (returnAddr >> 8) & 0xFF
        let loByte = returnAddr & 0xFF
        pushByte(hiByte)
        pushByte(loByte)
        let statusByte =
            (negative << 7)      |
            (overflow << 6)      |
            (1 << 5)             |
            (1 << 4)             |
            (decimal_mode << 3)  |
            (interrupt_disable << 2) |
            (zero << 1)          |
            carry
        pushByte(statusByte)
        interrupt_disable = 1
        let loVec = addrVal(0xFFFE)
        let hiVec = addrVal(0xFFFF)
        pc = ((hiVec << 8) | loVec) & 0xFFFF
    }
    function clc() { carry = 0 }
    function sec() { carry = 1 }
    function sed() { decimal_mode = 1 }
    function sei() { interrupt_disable = 1 }
    function cld() { decimal_mode = 0 }
    function cli() { interrupt_disable = 0 }
    function clv() { overflow = 0 }
    function dex() {
        let newX = (parseInt(x.join(""), 2) - 1) & 0xFF
        x = newX.toString(2).padStart(8, "0").split("")
    }
    function dey() {
        let newY = (parseInt(y.join(""), 2) - 1) & 0xFF
        y = newY.toString(2).padStart(8, "0").split("")
    }
    function inx() {
        let newX = (parseInt(x.join(""), 2) + 1) & 0xFF
        x = newX.toString(2).padStart(8, "0").split("")
    }
    function iny() {
        let newY = (parseInt(y.join(""), 2) + 1) & 0xFF
        y = newY.toString(2).padStart(8, "0").split("")
    }
    function tax() { x = accumulator.slice() }
    function tay() { y = accumulator.slice() }
    function tsx() { x = sp.slice() }
    function txa() { accumulator = x.slice() }
    function txs() { sp = x.slice() }
    function tya() { accumulator = y.slice() }
    function lda(param) {
        addressing_mode(param, "lda")
        let value = 0
        if (immediate) {
            value = baseConverter(param.substring(1))
        } else if (absolute || zeroPageMode) {
            value = addrVal(baseConverter(param))
        } else if (absoluteX || zeroPageX) {
            let addr = (baseConverter(param.split(",")[0]) + parseInt(x.join(""), 2)) & 0xFFFF
            value = addrVal(addr)
        } else if (absoluteY || zeroPageY) {
            let addr = (baseConverter(param.split(",")[0]) + parseInt(y.join(""), 2)) & 0xFFFF
            value = addrVal(addr)
        } else if (indirectY) {
            let yVal2 = parseInt(y.join(""), 2)
            let zAdd = baseConverter(param.split("(")[1].split(")")[0])
            let lo = addrVal(zAdd)
            let hi = addrVal((zAdd + 1) & 0xFF)
            let location = ((hi << 8) | lo) + yVal2
            value = addrVal(location)
        } else if (indirectX) {
            let xVal2 = parseInt(x.join(""), 2)
            let zAdd = baseConverter(param.split("(")[1].split(",")[0])
            let lo = addrVal((zAdd + xVal2) & 0xFF)
            let hi = addrVal((zAdd + xVal2 + 1) & 0xFF)
            let location = (hi << 8) | lo
            value = addrVal(location)
        }
        accumulator = value.toString(2).padStart(8, "0").split("")
        zero = (value === 0) ? 1 : 0
        negative = (value & 0x80) ? 1 : 0
    }
    function ldx(param) {
        addressing_mode(param, "ldx")
        let value = 0
        if (immediate) {
            value = baseConverter(param.substring(1))
        } else if (absolute || zeroPageMode) {
            value = addrVal(baseConverter(param))
        } else if (absoluteX || zeroPageX) {
            let addr = (baseConverter(param.split(",")[0]) + parseInt(x.join(""), 2)) & 0xFFFF
            value = addrVal(addr)
        } else if (absoluteY || zeroPageY) {
            let addr = (baseConverter(param.split(",")[0]) + parseInt(y.join(""), 2)) & 0xFFFF
            value = addrVal(addr)
        }
        x = value.toString(2).padStart(8, "0").split("")
        zero = (value === 0) ? 1 : 0
        negative = (value & 0x80) ? 1 : 0
    }
    function ldy(param) {
        addressing_mode(param, "ldy")
        let value = 0
        if (immediate) {
            value = baseConverter(param.substring(1))
        } else if (absolute || zeroPageMode) {
            value = addrVal(baseConverter(param))
        } else if (absoluteX || zeroPageX) {
            let addr = (baseConverter(param.split(",")[0]) + parseInt(x.join(""), 2)) & 0xFFFF
            value = addrVal(addr)
        } else if (absoluteY || zeroPageY) {
            let addr = (baseConverter(param.split(",")[0]) + parseInt(y.join(""), 2)) & 0xFFFF
            value = addrVal(addr)
        }
        y = value.toString(2).padStart(8, "0").split("")
        zero = (value === 0) ? 1 : 0
        negative = (value & 0x80) ? 1 : 0
    }
    function nop() {}
    function bcc(param) {
        addressing_mode(param, "bcc")
        if (!carry) {
            let offset = baseConverter(param)
            if (offset > 127) offset -= 256
            pc = (pc + offset) & 0xFFFF
            return true
        }
        return false
    }
    function bcs(param) {
        addressing_mode(param, "bcs")
        if (carry) {
            let offset = baseConverter(param)
            if (offset > 127) offset -= 256
            pc = (pc + offset) & 0xFFFF
            return true
        }
        return false
    }
    function beq(param) {
        addressing_mode(param, "beq")
        if (zero) {
            let offset = baseConverter(param)
            if (offset > 127) offset -= 256
            pc = (pc + offset) & 0xFFFF
            return true
        }
        return false
    }
    function bmi(param) {
        addressing_mode(param, "bmi")
        if (negative) {
            let offset = baseConverter(param)
            if (offset > 127) offset -= 256
            pc = (pc + offset) & 0xFFFF
            return true
        }
        return false
    }
    function bne(param) {
        addressing_mode(param, "bne")
        if (!zero) {
            let offset = baseConverter(param)
            if (offset > 127) offset -= 256
            pc = (pc + offset) & 0xFFFF
            return true
        }
        return false
    }
    function bpl(param) {
        addressing_mode(param, "bpl")
        if (!negative) {
            let offset = baseConverter(param)
            if (offset > 127) offset -= 256
            pc = (pc + offset) & 0xFFFF
            return true
        }
        return false
    }
    function bvc(param) {
        addressing_mode(param, "bvc")
        if (!overflow) {
            let offset = baseConverter(param)
            if (offset > 127) offset -= 256
            pc = (pc + offset) & 0xFFFF
            return true
        }
        return false
    }
    function bvs(param) {
        addressing_mode(param, "bvs")
        if (overflow) {
            let offset = baseConverter(param)
            if (offset > 127) offset -= 256
            pc = (pc + offset) & 0xFFFF
            return true
        }
        return false
    }
    var lines = asm.split('\n').map(line => (line.indexOf(';') !== -1 ? line.slice(0, line.indexOf(';')) : line).trim()).filter(line => line.length > 0)
    for (let i = 0; i < lines.length; i++) {
        let parts = lines[i].trim().split(' ')
        let instruction = parts[0].toLowerCase()
        let operand = parts[1] || ""
        let skipPCincrement = false
        switch (instruction) {
            case "brk":
                brk()
                skipPCincrement = true
                break
            case "jmp":
                jmp(operand)
                skipPCincrement = true
                break
            case "jsr":
                jsr(operand)
                skipPCincrement = true
                break
            case "rts":
                rts()
                skipPCincrement = true
                break
            case "rti":
                rti()
                skipPCincrement = true
                break
            case "bcc":
                skipPCincrement = bcc(operand)
                break
            case "bcs":
                skipPCincrement = bcs(operand)
                break
            case "beq":
                skipPCincrement = beq(operand)
                break
            case "bmi":
                skipPCincrement = bmi(operand)
                break
            case "bne":
                skipPCincrement = bne(operand)
                break
            case "bpl":
                skipPCincrement = bpl(operand)
                break
            case "bvc":
                skipPCincrement = bvc(operand)
                break
            case "bvs":
                skipPCincrement = bvs(operand)
                break
            default:
                eval(instruction + "(\"" + operand + "\")")
                break
        }
        if (!skipPCincrement) {
            pc = (pc + 1) & 0xFFFF
        }
    }
    return ("PC: " + pc.toString(16).padStart(4, "0").toUpperCase() + ", A: " + accumulator.join("") + ", X: " + x.join("") + "\n  Y: " + y.join("") + ", P (NV1B DIZC): " + negative + overflow + "1" + b + " " + decimal_mode + interrupt_disable + zero + carry)
}
window.asmCompiler = asmCompiler
