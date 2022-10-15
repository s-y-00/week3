// [assignment] implement a variation of mastermind from https://en.wikipedia.org/wiki/Mastermind_(board_game)#Variation as a circuit
pragma circom 2.0.3;

include "../../node_modules/circomlib/circuits/comparators.circom";
include "../../node_modules/circomlib/circuits/poseidon.circom";

template MastermindVariation () {
    // Public inputs
    signal input pubGuessA;
    signal input pubGuessB;
    signal input pubGuessC;
    signal input pubGuessD;
    signal input pubNumBlacks;
    signal input pubNumWhites;
    signal input pubSolnHash;

    // Private inputs
    signal input privSolnA;
    signal input privSolnB;
    signal input privSolnC;
    signal input privSolnD;
    signal input privSaltedSoln;

    // Output
    signal output solnHashOut;
    
    var charCount = 4;
    var guess[charCount] = [pubGuessA, pubGuessB, pubGuessC, pubGuessD];
    var soln[charCount] =  [privSolnA, privSolnB, privSolnC, privSolnD];

    component gusLet[charCount];
    component gusGet[charCount];
    component solLet[charCount];
    component solGet[charCount];

    // Inputs value must be between a = 0 to z = 25
    for (var i = 0; i < charCount; i++) {
        gusLet[i] = LessEqThan(8);
        solLet[i] = LessEqThan(8);

        gusGet[i] = GreaterEqThan(8);
        solGet[i] = GreaterEqThan(8);
        
        gusGet[i].in[0] <== guess[i];
        solGet[i].in[0] <== soln[i];
        gusGet[i].in[1] <== 0;
        solGet[i].in[1] <== 0;
        
        gusGet[i].out === 1;
        solGet[i].out === 1;

        gusLet[i].in[0] <== guess[i];
        solLet[i].in[0] <== soln[i];
        gusLet[i].in[1] <== 25;
        solLet[i].in[1] <== 25;

        gusLet[i].out === 1;
        solLet[i].out === 1;
    }

    var nb = 0;
    var nw = 0;

    // Count black pegs
    component isBk[charCount];
    for (var i=0; i<charCount; i++) {
        isBk[i] = IsEqual();
        isBk[i].in[0] <== guess[i];
        isBk[i].in[1] <== soln[i];

        nb += isBk[i].out;
    }

    // Count white pegs
    var k = 0;
    var j = 0;
    component isWh[charCount][charCount];
    for (j=0; j < charCount; j++) {
        for (k=0; k < charCount; k++) {
            isWh[j][k] = IsEqual();
            isWh[j][k].in[0] <== guess[j];
            isWh[j][k].in[1] <== soln[k];
            
            if (j != k) {
                nw += isWh[j][k].out;
            }
        }
    }

    component isEqNb = IsEqual();
    isEqNb.in[0] <== pubNumBlacks;
    isEqNb.in[1] <== nb;
    isEqNb.out === 1;

    component isEqNw = IsEqual();
    isEqNw.in[0] <== pubNumWhites;
    isEqNw.in[1] <== nw;
    isEqNw.out === 1;

    component poseidon = Poseidon(charCount+1);
    poseidon.inputs[0] <== privSaltedSoln;
    poseidon.inputs[1] <== privSolnA;
    poseidon.inputs[2] <== privSolnB;
    poseidon.inputs[3] <== privSolnC;
    poseidon.inputs[4] <== privSolnD;
    
    solnHashOut <== poseidon.out;
    pubSolnHash === solnHashOut;
}

component main {
    public [ 
        pubGuessA,
        pubGuessB,
        pubGuessC,
        pubGuessD,
        pubNumBlacks,
        pubNumWhites,
        pubSolnHash
    ]
} = MastermindVariation();
