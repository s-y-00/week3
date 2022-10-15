const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const { buildPoseidon } = require("circomlibjs");

const wasm_tester = require("circom_tester").wasm;

const F1Field = require("ffjavascript").F1Field;
const Scalar = require("ffjavascript").Scalar;
exports.p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(exports.p);

describe("MastermindVariation unit test", function () {

    beforeEach(async function () {
        poseidon = await buildPoseidon();
    });

    it("should return correct hash if the guess is correctly", async function () {
        const circuit = await wasm_tester("contracts/circuits/MastermindVariation.circom");

        const solution_str = ["z", "e", "r", "o"];
        const guess_str = ["z", "e", "r", "o"];
        const solution = charsToInt(solution_str);
        const guess = charsToInt(guess_str);
        const salt = ethers.BigNumber.from(ethers.utils.randomBytes(32));
        const solnHash = poseidon.F.toObject(poseidon([salt, ...solution]));
        // console.log("solnHash", solnHash);

        const input = {
            "pubGuessA": solution[0],
            "pubGuessB": solution[1],
            "pubGuessC": solution[2],
            "pubGuessD": solution[3],
            "privSolnA": guess[0],
            "privSolnB": guess[1],
            "privSolnC": guess[2],
            "privSolnD": guess[3],
            "pubNumBlacks": "4",
            "pubNumWhites": "0",
            "pubSolnHash": solnHash,
            "privSaltedSoln": salt
        }

        const witness = await circuit.calculateWitness(input, true);
        expect(solnHash).to.equal(witness[1]);
    });

    it("should return an error if the guess is incorrect", async function () {
        const circuit = await wasm_tester("contracts/circuits/MastermindVariation.circom");

        const solution_str = ["z", "e", "r", "o"];
        const guess_str = ["w", "o", "r", "d"];
        const solution = charsToInt(solution_str);
        const guess = charsToInt(guess_str);
        const salt = ethers.BigNumber.from(ethers.utils.randomBytes(32));
        const solnHash = poseidon.F.toObject(poseidon([salt, ...solution]));
        // console.log("solnHash", solnHash);

        const input = {
            "pubGuessA": solution[0],
            "pubGuessB": solution[1],
            "pubGuessC": solution[2],
            "pubGuessD": solution[3],
            "privSolnA": guess[0],
            "privSolnB": guess[1],
            "privSolnC": guess[2],
            "privSolnD": guess[3],
            "pubNumBlacks": "4",
            "pubNumWhites": "0",
            "pubSolnHash": solnHash,
            "privSaltedSoln": salt
        }

        expect(circuit.calculateWitness(input, true)).to.be.revertedWith(Error);
    });

    it("should return an error if the guess is out of range", async function () {
        const circuit = await wasm_tester("contracts/circuits/MastermindVariation.circom");

        const solution_str = ["z", "e", "r", "o"];
        const guess_str = ["1", "2", "3", "4"];
        const solution = charsToInt(solution_str);
        const guess = charsToInt(guess_str);
        const salt = ethers.BigNumber.from(ethers.utils.randomBytes(32));
        const solnHash = poseidon.F.toObject(poseidon([salt, ...solution]));
        // console.log("solnHash", solnHash);

        const input = {
            "pubGuessA": solution[0],
            "pubGuessB": solution[1],
            "pubGuessC": solution[2],
            "pubGuessD": solution[3],
            "privSolnA": guess[0],
            "privSolnB": guess[1],
            "privSolnC": guess[2],
            "privSolnD": guess[3],
            "pubNumBlacks": "0",
            "pubNumWhites": "0",
            "pubSolnHash": solnHash,
            "privSaltedSoln": salt
        }

        expect(circuit.calculateWitness(input, true)).to.be.revertedWith(Error);
    });

    it("should return an error if the pubNumBlacks is incorrect", async function () {
        const circuit = await wasm_tester("contracts/circuits/MastermindVariation.circom");

        const solution_str = ["z", "e", "r", "o"];
        const guess_str = ["z", "e", "r", "o"];
        const solution = charsToInt(solution_str);
        const guess = charsToInt(guess_str);
        const salt = ethers.BigNumber.from(ethers.utils.randomBytes(32));
        const solnHash = poseidon.F.toObject(poseidon([salt, ...solution]));
        // console.log("solnHash", solnHash);

        const input = {
            "pubGuessA": solution[0],
            "pubGuessB": solution[1],
            "pubGuessC": solution[2],
            "pubGuessD": solution[3],
            "privSolnA": guess[0],
            "privSolnB": guess[1],
            "privSolnC": guess[2],
            "privSolnD": guess[3],
            "pubNumBlacks": "0",
            "pubNumWhites": "0",
            "pubSolnHash": solnHash,
            "privSaltedSoln": salt
        }

        expect(circuit.calculateWitness(input, true)).to.be.revertedWith(Error);
    });

    it("should return an error if the pubNumWhites is incorrect", async function () {
        const circuit = await wasm_tester("contracts/circuits/MastermindVariation.circom");

        const solution_str = ["z", "e", "r", "o"];
        const guess_str = ["z", "e", "r", "o"];
        const solution = charsToInt(solution_str);
        const guess = charsToInt(guess_str);
        const salt = ethers.BigNumber.from(ethers.utils.randomBytes(32));
        const solnHash = poseidon.F.toObject(poseidon([salt, ...solution]));
        // console.log("solnHash", solnHash);

        const input = {
            "pubGuessA": solution[0],
            "pubGuessB": solution[1],
            "pubGuessC": solution[2],
            "pubGuessD": solution[3],
            "privSolnA": guess[0],
            "privSolnB": guess[1],
            "privSolnC": guess[2],
            "privSolnD": guess[3],
            "pubNumBlacks": "0",
            "pubNumWhites": "4",
            "pubSolnHash": solnHash,
            "privSaltedSoln": salt
        }

        expect(circuit.calculateWitness(input, true)).to.be.revertedWith(Error);
    });
});

function charsToInt(word) {
    return word.map(w => w.codePointAt(0) - 97);
}