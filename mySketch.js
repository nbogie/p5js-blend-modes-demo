///<reference path="TSDef/p5.global-mode.d.ts" />
//https://breaksome.tech/p5js-editor-how-to-set-up-visual-studio-code/


//was at https://www.openprocessing.org/sketch/901360

"use strict";

let chosenBlendMode;
let previousBlendMode;
let blendModeInfos;

let myFont;


function preload() {
	myFont = loadFont("Roboto-Medium.ttf");
}

function setup() {
	createCanvas(windowWidth, windowHeight);
	background(100);
	rectMode(CENTER);

	blendModeInfos = [
		[SOFT_LIGHT, "1", "SOFT_LIGHT", "Mix of DARKEST and LIGHTEST.  Works like OVERLAY, but not as harsh."],
		[HARD_LIGHT, "2", "HARD_LIGHT", "SCREEN when greater than 50% gray, MULTIPLY when lower."],
		[BLEND, "3", "BLEND", "Default.  Linear interpolation of colours (default)"],
		[MULTIPLY, "4", "MULTIPLY", "Multiply the colors, result will always be darker."],

		[SCREEN, "5", "SCREEN", "Opposite multiply, uses inverse values of the colors."],
		[BURN, "6", "BURN", "Darker areas are applied, increasing contrast, ignores lights."],
		[DODGE, "7", "DODGE", "Lightens light tones and increases contrast, ignores darks."],
		[OVERLAY, "8", "OVERLAY", "Mix of MULTIPLY and SCREEN.  Multiplies dark values, and screens light values."],

		[ADD, "9", "ADD", "Sum of A and B"],
		[DARKEST, "0", "DARKEST", "Only the darkest colour succeeds"],
		[LIGHTEST, "-", "LIGHTEST", "Only the lightest colour succeeds"],
		[DIFFERENCE, "=", "DIFFERENCE", "Subtract colors from underlying image."],
		[EXCLUSION, "q", "EXCLUSION", "Similar to DIFFERENCE, but less extreme.", true],
		[REPLACE, "w", "REPLACE", "The pixels entirely replace the others and don't utilize alpha (transparency) values.", true],
		[REMOVE, "e", "REMOVE", "Removes pixels from B with the alpha strength of A.", true],
	].map(([mode, shortcut, name, description, skip]) => {
		return {
			mode,
			shortcut,
			name,
			description,
			skip
		};
	});

	randomiseTheBlendMode();
}

function mousePressed() {
	background(100);
	randomiseTheBlendMode();
}

function randomiseTheBlendMode() {
	const interestingModes = blendModeInfos.filter(i => !i.skip);
	chosenBlendMode = random(interestingModes);
	blendMode(chosenBlendMode.mode);
}

function fillWithRandomColour() {
	colorMode(HSB, 360, 100, 100);
	let h = random(360);
	let s = random([100, 40]);
	let b = 100;
	fill(h, s, b);
}

function draw() {
	var w = random(50, 300);
	var h = random(50, 300);
	var xPos = random(windowWidth);
	var yPos = random(windowHeight);

	fillWithRandomColour();
	var cornerRadius = random(10, 25);
	noStroke();
	rect(xPos, yPos, w, h, cornerRadius);

	drawAllTextOverlays();

}


function drawBackingForText(font, str, x, y, size, vPad) {
	blendMode(BLEND);
	colorMode(RGB);
	fill(0);
	const bounds = font.textBounds(str, x, y, size);
	rectMode(CORNER);
	rect(-10, bounds.y - vPad, width + 20, bounds.h + vPad + vPad);
}

function drawAllTextOverlays() {
	let bigTextSize = round(height / 16.5);
	let smallTextSize = round(bigTextSize / 2.4);

	//save the current blend mode, etc
	push();
	//set to a controlled blend mode to get reliable result
	let str = chosenBlendMode.name;
	drawBackingForText(myFont, str, 100, height - 100, bigTextSize, 30);
	drawBackingForText(myFont, chosenBlendMode.description, 100, height - 70, smallTextSize, 10);
	fill('white');
	textFont(myFont);
	textSize(bigTextSize);
	let shortcutLabel = `(${chosenBlendMode.shortcut})`;
	let b = myFont.textBounds(shortcutLabel, 0, 0, bigTextSize);
	text(shortcutLabel, 20, height - 100);
	let mainTextX = 20 + b.w + 30;

	text(str, mainTextX, height - 100);

	textSize(smallTextSize);
	text(chosenBlendMode.description, mainTextX, height - 70);

	if (previousBlendMode) {
		drawSideLabelFor(previousBlendMode, myFont, smallTextSize, true);
	}
	drawSideLabelFor(chosenBlendMode, myFont, smallTextSize);
	//restore the blendMode...
	pop();
}

function drawSideLabelFor(modeInfo, font, textSz, isWipe = false) {
	push();
	blendMode(BLEND);

	const makeLabel = (shortcut, name) => shortcut + " " + name;

	const longestName = blendModeInfos.map(bmi => bmi.name).sort((a, b) => a - b)[0];
	const worstBounds = font.textBounds(makeLabel("1", longestName), 0, 0, textSz);

	const positionsLookup = "1234567890-=qwe".split("");
	const ix = positionsLookup.indexOf(modeInfo.shortcut);
	const str = makeLabel(modeInfo.shortcut, modeInfo.name);

	textSize(textSz);
	rectMode(CORNER);
	fill(0);
	let y = 30 + height * (1 / positionsLookup.length) * ix;
	const bounds = font.textBounds(str, 0, y, textSz);
	let x = width - worstBounds.w - 20;
	//rect(x, 0, x, height);
	rect(x, bounds.y - 10, bounds.w + 200, bounds.h + 20);
	if (!isWipe) {
		fill('white');
		text(str, x + 10, y);
	}
	pop();
}

function keyPressed() {
	const found = blendModeInfos.find(info => key === info.shortcut);
	if (found) {
		previousBlendMode = chosenBlendMode;
		chosenBlendMode = found;
		blendMode(chosenBlendMode.mode);
	}
}