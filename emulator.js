/*
Rishi Sanjeev
Pd. D
5-15-25
Final Project - P5-6502

A PiCode P5*JS 6502 processor emulator with an assembly code editor,
complete with a console for easy access to register values (accumulator,
x, y, and p (processor flags) and program counter). Also featured is a
graphical representation of the 64kb memory using black and white squares
on a 600x600 grid. Features include code editor themes, running, saving,
file renaming, assembly tutorials, PiCode legacy view implementation,
reloading, and an application map with arrows pointing to various
elements of the program.

The 6502 processor is an MOS Technology 8-bit microprocessor introduced
in 1975 as a low-cost alternative to the 6800 and Intel 8080. It started
the home computer revolution of the 80s and was used in legendary devices,
including the Atari 2600, Apple II, NES, Commodore 64, Lynx, and BBC Micro.

The 6502 is little-endian and contains a 16-bit address bus. Its registers include:

A = 8-bit accumulator register
P = 7-bit processor status register
n = Negative
v = Overflow
b = Break (only in stack values, not in hardware)
d = Decimal
i = Interrupt disable
z = Zero
c = Carry
PC = 16-bit program counter
S = 8-bit stack pointer
X = 8-bit index register
Y = 8-bit index register

Its specialized zero-page addressing mode helped it be competitive despite its lack of registers.
6502 assembly has 13 addressing modes in total.



     .----------------------------------------.
     |                MOS 6502                |
     |----------------------------------------|
     |                                        |
     |   .-----.   .-----.   .-----.          |
     |   | ACC |   |  X  |   |  Y  |          |  <-- Registers
     |   '-----'   '-----'   '-----'          |
     |      |         |         |             |
     |      |         `-----.   |             |
     |      `-------------. |   |             |
     |   .------------------------------.     |
     |   |  ALU (Arithmetic Logic Unit) |     |  <-- Performs math/logical ops
     |   '------------------------------'     |
     |                 |                      |
     |        .--------+--------.             |
     |        |   Status Flags   |            |  <-- NV-BDIZC
     |        '------------------'            |
     |                 |                      |
     |   .-------------------------------.    |
     |   |   Instruction Decoder &       |    |
     |   |     Control Logic             |    |
     |   '-------------------------------'    |
     |                 |                      |
     |     .--------------------------.       |
     |     |     Program Counter      |       |
     |     '--------------------------'       |
     |                 |                      |
     |     .--------------------------.       |
     |     |     Stack Pointer        |       |
     |     '--------------------------'       |
     |                 |                      |
     |     .--------------------------.       |
     |     |    Address Bus / MUX     |       |
     |     '--------------------------'       |
     |                 |                      |
     |           .-------------.              |
     |           |  Data Bus   |<-------------'
     |           '-------------'              |
     |                                        |
     '----------------------------------------'

To effectively utilize this program, you must know how
to program in 6502 assembly. A tutorial is linked via
the ❓ button in the right-hand menu.

PiCode limitations:

PiCode has a line limit. This makes it less than ideal for a final project, and due to the nature of my project, I was unable to shorten the code.
An easy work around was to store the contents of the main compiler function asynchronously, on GitHub, and fetch and eval the raw content of the Github page through a CORS proxy. The CORS proxy is due to GitHub's raw url fetch not providing proper CORS headers sometimes. When testing my code, which should fully work, you may have to open this link: https://cors-anywhere.herokuapp.com/corsdemo to enable the CORS server on your device temporarily. This is clearly stated with a label and link to the proxy enabler. You can find the asmCompiler() function, which contains the bulk of the code, as well as a copy of the code stored on PiCode, in my Github repository here: https://github.com/RishiSanjeev/P5-6502/blob/main/emulator.js.
Another workaround due to PiCode limitations was the necessity to open the project in fullscreen legacy view before utilizing the save function. This presents as having to ctrl+click the window button on the right side of the screen before pressing the save icon.
Also, as PiCode does not have project renaming capabilities, it states that is an x86 asm emulator in the filename, however, the description corrects this.

*/

// Pages 1 and 2
var zeroPage = ("00000000".repeat(256)).split('')
var stack = ("00000000".repeat(256)).split('')
// Registers
var pc = 0
var sp = "00000000".split('')
var accumulator = "00000000".split('')
var x = "00000000".split('')
var y = "00000000".split('')
// Last 6 bytes
var irq = "0".repeat(16).split(''), nmi = "0".repeat(16).split(''), reset = "0".repeat(16).split('')
var memory = zeroPage.concat(stack, "0".repeat(65024).split(""), irq, nmi, reset)
// Flags
var carry = 0
var zero = 0
var interrupt_disable = 0
var decimal_mode = 0
var break_command = 0
var overflow = 0 // V
var negative = 0 // N
var b = 0
// Syntax
var binary = false
var hex = false
var decimal = false
// Addressing modes
var immediate = false, accumulatorMode = false, absolute = false, absoluteX = false, absoluteY = false, implied = false, indirect = false, indirectX = false, indirectY = false, relative = false, zeroPageMode = false, zeroPageX = false, zeroPageY = false
// List of instructions that utilize the addressing modes
var impliedList = ["brk", "clc", "cld", "cli", "clv", "dex", "dey", "inx", "iny", "nop", "pha", "php", "pla", "plp", "rti", "rts", "sec", "sed", "sei", "tax", "tay", "tsx", "txa", "txs", "tya"]
var zeroPageList = ["adc", "and", "asl", "bit", "cmp", "cpx", "cpy", "dec", "eor", "inc", "lda", "ldx", "ldy", "lsr", "ora", "rol", "ror", "sbc", "sta", "stx", "sty"]
var relativeList = ["bcc", "bcs", "beq", "bmi", "bne", "bpl", "bvc", "bvs"]

var input, fileInp
const date = new Date()
let day = date.getDate()
let month = date.getMonth() + 1
let year = date.getFullYear()
let currentDate = `${month}-${day}-${year}`
var program_counter = 0
let asmCompilerFn = null

function run() {
    if (asmCompilerFn) {
        runCompiler()
        return
    }
    fetch('https://cors-anywhere.herokuapp.com/https://raw.githubusercontent.com/RishiSanjeev/P5-6502/main/asmCompiler.js')
    .then(response => {
      if (!response.ok) throw new Error(`Network error: ${response.status}`)
      return response.text()
    })
    .then(code => {
      (0, eval)(code)
      if (typeof asmCompiler === 'function') {
        asmCompilerFn = asmCompiler
        runCompiler()
      } else {
        throw new Error('asmCompiler is not defined after eval')
      }
    })
    .catch(error => {
      console.error('Error loading asmCompiler:', error)
    })
}

function runCompiler() {
  let result
  try {
    result = asmCompilerFn(input.value())
  } catch (err) {
    result = 'Error running asmCompiler: ' + err.message
  }
  fill(0, 255, 0)
  textSize(18)
  if (program_counter !== 0) {
    text("> " + result, 20, 440 + 45 * program_counter)
  } else {
    text("  " + result, 20, 440 + 20 * program_counter)
  }
  program_counter++
  if (program_counter >= 4) {
    program_counter = 0
    textFont("Consolas")
    fill(black)
    rect(0, 400, 600, 200)
    textSize(20)
    textStyle(BOLDITALIC)
    fill(...green)
    text("Console:\n>", 20, 420)
  }
}

function downloadTextFile() {
  let filename = fileInp.value()
  save(input.value().split(/\r\n|\r|\n/), filename+".asm")
}

function reload() {
  main()
}

var blue = [0,0,255]
var green = [0, 255, 0]
var black = 0
var white = 255
var consoleBg = black
var consoleTxt = green

function theme() {
  consoleBg = Array.isArray(consoleBg) ? black : blue
  consoleTxt = Array.isArray(consoleTxt) ? white : green
  program_counter = 0
  textFont("Consolas")
  Array.isArray(consoleBg) ? fill(...consoleBg) : fill(consoleBg)
  rect(0, 400, 600, 200)
  textSize(20)
  textStyle(BOLDITALIC)
  Array.isArray(consoleTxt) ? fill(...consoleTxt) : fill(consoleTxt)
  text("Console:\n>", 20, 420)
}

function main() {
  program_counter = 0
  createCanvas(1200, 600)
  textFont("Consolas")
  background(white)

  fill(200)
  noStroke()
  rect(0, 0, 600, 40, 0, 0, 20, 20)

  fill(black)
  textSize(20)
  textStyle(BOLDITALIC)
  text("6502 Emulator", 30, 27)
  let aCORSProxy = createA("https://cors-anywhere.herokuapp.com/corsdemo","Enable CORS proxy - required for async compilation")
  aCORSProxy.position(205, 38)
  aCORSProxy.style("color", color(...blue))
  aCORSProxy.style("text-decoration", "underline")
  aCORSProxy.style("font-family","Consolas")
  aCORSProxy.style("font-size","14px")
  Array.isArray(consoleBg) ? fill(...consoleBg) : fill(consoleBg)
  rect(0, 400, 600, 200)
  Array.isArray(consoleTxt) ? fill(...consoleTxt) : fill(consoleTxt)
  input = createElement("textarea")
  input.style("vertical-align", "top")
  input.position(40, 80)
  input.size(520, 320)

  var runButton = createButton("▶")
  runButton.position(570, 80)

  var saveButton = createButton("💾")
  saveButton.position(570, 100)

  text("Console:\n>", 20, 420)

  runButton.mousePressed(run)
  saveButton.mousePressed(downloadTextFile)

  var reloadButton = createButton("🔄")
  reloadButton.position(570, 120)
  reloadButton.mousePressed(reload)

  var themeButton = createButton("🎨")
  themeButton.position(570, 140)
  themeButton.mousePressed(theme)

  var tutorialButton = createA("https://skilldrick.github.io/easy6502/","❓")
  tutorialButton.position(570, 160)

  var windowButton = createA("https://picode.education/project/cmav4t9lg0001mune6q3qpuvn/legacyview/fullscreen?classId=undefined","🪟","width=1200,height=600")
  windowButton.position(570, 180)
  
  fileInp = createInput("save-"+currentDate)
  fileInp.position(570, 205)
  fileInp.size(20,20)

  textStyle(NORMAL)
  fill(black)
  textSize(10)
  text("Type assembly ↑; Register values ↓; Memory visualization →; Filename input ↗; Run Ctrl+🪟 before 💾",35,390)
}

function setup() {
  main()
}

function draw() {
  let cols = 64
  let cellSize = 8
  for (let i = 0; i < 256; i++) {
    memory[i] === "1" ? fill(255) : fill(0)
    let xPos = (i % cols) * cellSize + 600
    let yPos = Math.floor(i / cols) * cellSize
    square(xPos, yPos, cellSize)
  }
}
