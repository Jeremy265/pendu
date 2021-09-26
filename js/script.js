let word;
let indexRevealed;
let attempts = [];
let nbAttemptsToLoose = 6;

const removeAccents = (str) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

const chooseWord = (lang, cat) => {
    const file = "./assets/data/" + cat;
    return $.get(file, (file) => {
        const words = file[lang];
        const numberOfWords = words.length;
        const randomNumber = Math.round((Math.random() * (numberOfWords-1)));
        word = removeAccents(words[randomNumber]).toUpperCase();
        indexRevealed = [];
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
            wordToDisplay += " " + word[i] + " ";
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
        if (!indexRevealed.includes(false)) {
            handleWin();
        }
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

    if (attempts.includes(answer)) {
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

const fillLangage = () => {
    const source = "./assets/data/categories.json";
    $.get(source, (source) => {
        $.each(source, (language) => {
            $("#languages").append("<option value='"+language+"'>"+language+"</option>");
        })
    }).then(() => {
        $("#languages").trigger("change");
    }).fail((response) => {
        alert("Erreur (" + response.status + ") : " + response.statusText);
    });
}

const fillCategoryByLanguage = (lang) => {
    const source = "./assets/data/categories.json";
    $.get(source, (source) => {
        $.each(source, (language, categories) => {
            if (language === lang) {
                $.each(categories, (index, category) => {
                    $("#categories").append("<option value='"+category.file+"'>"+category.label+"</option>");
                });
            }
        })
    }).then(() => {
        $("#categories").trigger("change");
    }).fail((response) => {
        alert("Erreur (" + response.status + ") : " + response.statusText);
    });
}

$("#categories").on("change", () => {
    $("#start")
        .html("Jouer !")
        .removeClass("btn-warning")
        .addClass("btn-success");
})

$("#languages").on("change", () => {
    const lang = $("#languages").val();
    $("#categories").empty();
    if (lang === "") {
        $("#start").attr("disabled", "disabled");
        return;
    }
    $("#start").removeAttr("disabled");
    fillCategoryByLanguage(lang);
})

const start = () => {
    attempts = [];
    nbAttemptsToLoose = 6;
    $("#error").empty().hide();
    $("#word")
        .removeClass("text-danger")
        .removeClass("text-success");
    $("#attempts").empty();

    const lang = $("#languages").val();
    const cat = $("#categories").val();
    if (lang === "" || cat === "") {
        alert("Serieusement?");
        return;
    }
    $("#attempts-left").html(nbAttemptsToLoose);
    $("#answer").removeAttr("disabled");
    $("#word").html("Choix du mot...");
    chooseWord(lang, cat)
        .then(() => {
            $("#word").html(getWordByRevealedLetters());
        });
}

$("#start").on("click", () => {
    $("#start")
        .html("Recommencer !")
        .removeClass("btn-success")
        .addClass("btn-warning")
    start();
});

$(document).ready(() => {
    fillLangage();
})
