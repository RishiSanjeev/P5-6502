/*
Rishi Sanjeev
Pd. D
5-15-25
Final Project - 6502 Emulator
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
