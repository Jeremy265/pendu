let word;
let indexRevealed = [];
attempts = [];
nbAttemptsToLoose = 6;

const chooseWord = () => {
    const dico = "./assets/data/dico.txt";
    return $.get(dico, (file) => {
        const words = file.split("\r\n");
        const numberOfWords = words.length;
        const randomNumber = Math.round((Math.random() * numberOfWords));
        word = words[randomNumber].toUpperCase();
        for (let i = 0; i < word.length; i++) {
            indexRevealed[i] = false;
        }
    }).fail((response) => {
        alert("Erreur (" + response.status + ") : " + response.statusText);
    });
}

getWordByRevealedLetters = () => {
    let wordToDisplay = "";
    for (let i = 0; i < word.length; i++) {
        if (indexRevealed[i]) {
            wordToDisplay += word[i];
        } else {
            wordToDisplay += " _ ";
        }
    }
    return wordToDisplay;
}

const checkAnswerFormat = (answer) => {
    return answer.length === 1 || answer.length === word.length;
}

$("#answer").on("input", () => {
    const answer = $("#answer").val();
    if (answer === "") {
        return;
    }
    if (checkAnswerFormat(answer)) {
        $("#error").html("").hide();
        return;
    }
    $("#error").html("Essaye une lettre ou un mot de même longueur (" + word.length + " lettres) !").show();
});

const handleWrong = (answer) => {
    attempts.push(answer);
    const url = "./assets/images/attempt_" + (attempts.length + 1) + ".png";
    $("#attempt-image").attr("src", url);
    $("#attempts-left").html(nbAttemptsToLoose - attempts.length);
    $("#attempts").append($("<li>" + answer + "</li>"));
    if (attempts.length === nbAttemptsToLoose) {
        handleLoose();
    }
}

const handleRightLetter = (answer) => {
    for (let i = 0; i < word.length; i++) {
        if (word[i] === answer) {
            indexRevealed[i] = true;
        }
    }
    $("#word").html(getWordByRevealedLetters());
}

const handleSubmitLetter = (answer) => {
    if (word.indexOf(answer) >= 0) {
        handleRightLetter(answer);
        return;
    }
    handleWrong(answer);
}

const handleSubmitWord = (answer) => {
    if (answer !== word) {
        handleWrong(answer);
        return;
    }
    handleWin();
}

const handleLoose = () => {
    $("#word")
        .html(word)
        .addClass("text-danger");
    $("#error")
        .html("Tu as perdu !")
        .show();
    $("#answer").attr("disabled", "disabled");
}

const handleWin = () => {
    $("#word")
        .html(word)
        .addClass("text-success");
    $("#error")
        .html("Tu as gagné !")
        .removeClass("alert-danger")
        .addClass("alert-success")
        .show();
    $("#answer").attr("disabled", "disabled");
}

$("form").on("submit", (e) => {
    e.preventDefault();

    const answer = $("#answer").val().toUpperCase();
    if (!checkAnswerFormat(answer)) {
        return;
    }

    if ($.inArray(answer, attempts) >= 0) {
        $("#error").html("Déjà proposé !").show();
        $("#answer").val("");
        return;
    }

    if (answer.length === 1) {
        handleSubmitLetter(answer);
    } else if (answer.length === word.length) {
        handleSubmitWord(answer);
    } else {
        alert("Tu te fiches de moi ?");
    }
    $("#answer").val("");
})

$(document).ready(() => {
    $("#attempts-left").html(nbAttemptsToLoose);
    $("#word").html("Choix du mot...");
    chooseWord()
        .then(() => {
            $("#word").html(getWordByRevealedLetters());
        });
})
