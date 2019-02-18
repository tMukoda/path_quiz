/**
 * Created by takashi on 2019/02/14.
 */

//Use strict mode to use let & const
"use strict";

//Set up variables
const pencilPosition = [[600, 120], [600, 120], [600, 120], [460, 300], [460, 300], [460, 300], [540, 300], [540, 300]];
const cursorPosition = [[370, 220], [540, 300], [100, 300], [280, 220], [540, 300], [600, 120], [370, 220], [190, 300]];

const questions = [
    "You are editing 'index.html' in 'project' folder. What is the path to the 'main.js'?",
    "You are editing 'index.html' in 'project' folder. What is the path to the 'index.html' in 'contact' folder?",
    "You are editing 'index.html' in 'project' folder. What is the path to the '2018_0.jpg' in '2018' folder?",
    "You are editing 'index.html' in 'profile' folder. What is the path to the 'style.css'?",
    "You are editing 'index.html' in 'profile' folder. What is the path to the 'index.html' in'contact' folder?",
    "You are editing 'index.html' in 'profile' folder. What is the path to the 'index.html' in 'project' folder?",
    "You are editing 'index.html' in 'contact' folder. What is the path to the 'main.js'?",
    "You are editing 'index.html' in 'contact' folder. What is the path to the '2019_0.jpg' in '2019' folder?",
];
const answers = [
    ["js/main.js","/js/main.js","./js/main.js"],
    ["html/contact", "html/contact/", "html/contact/index.html", "/html/contact", "/html/contact/", "/html/contact/index.html","./html/contact", "./html/contact/", "./html/contact/index.html"],
    ["images/2018/2018_0.jpg", "/images/2018/2018_0.jpg","./images/2018/2018_0.jpg"],
    ["/css/style.css", "../../css/style.css"],
    ["/html/contact", "/html/contact/", "/html/contact/index.html", "../contact", "../contact/", "../contact/index.html"],
    ["/", "/index.html", "../../", "../../index.html"],
    ["/js/main.js", "../../js/main.js"],
    ["/images/2019/2019_0.jpg", "../../images/2019/2019_0.jpg"],
];

const characterPosition = ["10%", "19%", "27%", "36%", "44%", "53%", "61%", "70%", "80%"];
let characterStep = 0;
let questionNumber = 0; //index pointing to a current question

//Get image elements
const pencilImage = document.getElementById("pencil");
const cursorImage = document.getElementById("cursor");

//check if the slide is showing answer or not
let answerShown = false; //True: answer shown - False: answer not shown

let correctCounter = 0;

$(document).ready(function () {
    setup();

    //When click on text input, make it blank
    $('#textInput').click(function () {
        $(this).attr('value', '');
    });

    //Prevent refreshing the page when clicking a submit button
    $("#answerForm").submit(function (e) {
        e.preventDefault();
    });

    
    $('#submitButton').click(function () {
        //If answer is shown in input text area, go next question
        if (answerShown) {
            //Add swipe animation
            $('#slide').addClass('swipe');
            answerShown = false;

            //check if we reach the last question
            if (questionNumber < questions.length - 1) {
                questionNumber++;
                showNextQuestion();
            } else {
                showResult();
            }

        } else {
            //If the answer is correct
            if (checkAnswer()) {

                //Show check mark
                $('#checkMark').css('display','block');
                $('#checkPath').addClass('checked');
                $('#submitButton').prop('disabled', true);

                //Go next question
                setTimeout(function(){
                    $('#slide').addClass('swipe');
                    //Add swipe animation
                    characterStep++;
                    correctCounter++; //If answer is correct, count up
                    if (questionNumber < questions.length - 1) {
                        questionNumber++;
                        showNextQuestion();
                    } else {
                        showResult();
                    }
                }, 1000);
            } else {
                //Make answer text
                let answer = "";
                for (let i = 0; i < answers[questionNumber].length; i++) {
                    //avoid showing more than 3 answers
                    if (i > 2) {
                        answer = answer.substring(0, answer.length - 3);
                        answer += "etc";
                        break;
                    } else {
                        if (i === answers[questionNumber].length - 1) {
                            answer += answers[questionNumber][i];
                        } else {
                            answer += answers[questionNumber][i] + " or ";
                        }
                    }
                }
                $('#slide').addClass('shake');
                $('#submitButton').attr('value', 'next');
                $('#answerForm')[0].reset();
                $('#textInput').prop('disabled', true).attr('value', answer).css('color', 'red'); //Show answer in input text area

                setTimeout(
                    function () {
                        $('#slide').removeClass('shake');
                        answerShown = true;
                    },
                    1000);
            }
        }

    });

    $('#refresh_button').click(function(){
        reset();
    })
});

//Set up to show a next question
let showNextQuestion = () => {
    setTimeout(
        function () {
            setup();
            $('#textInput').attr('value', '');
            $('#submitButton').prop('disabled', true);
        },
        500);

    setTimeout(
        function () {
            $('#slide').removeClass('swipe');
            $('#submitButton').prop('disabled', false);
        },
        1000);
};

//Set up to show a result
let showResult = () => {
    $('#slide').addClass('swipe');

    setTimeout(
        function () {
            $('#questionArea').css('display', 'none');
            $('#diagramArea').css('display', 'none');
            $('#resultArea').css('display', 'block');
            $('#resultText').text("Result " + correctCounter + "/8");

            if (correctCounter !== questions.length) {
                $('#resultArea_character0').css('display', 'inline-block');
            } else {
                $('#resultArea_character1').css('display', 'inline-block');
            }

            characterMove();
        },
        500);
    setTimeout(
        function () {
            $('#slide').removeClass('swipe');

            if (correctCounter === questions.length) {
                $('#characterArea_character0').attr("src", "images/character_4.png").addClass('jump');
                $('#characterArea_character1').css('display', 'none');
            }
        },
        1000);
};

//Initial setup 
let init = () => {
    updateYear();
    reset();
    changePosition(pencilPosition[questionNumber][0], pencilPosition[questionNumber][1], cursorPosition[questionNumber][0], cursorPosition[questionNumber][1]);
};

//Update year for copyright
let updateYear = () => {
    let footer = document.getElementsByTagName("footer")[0];
    let today = new Date();
    let year = today.getFullYear();
    footer.innerHTML = "&copy; Takashi Mukoda " + year;
};

//check if the answer is correct or not
let checkAnswer = () => {
    let answer_typed = document.getElementById("textInput").value;
    let correct = false; //if the answer is correct, it's gonna be true
    for (let i = 0; i < answers[questionNumber].length; i++) {
        if (answer_typed === answers[questionNumber][i]) {
            correct = true;
            break;
        }
    }

    return correct; //return boolean value (true: answer is correct)
};

//set up a question
let setup = () => {
    $('#questionText').text(questions[questionNumber]); //show next question
    changePosition(pencilPosition[questionNumber][0], pencilPosition[questionNumber][1], cursorPosition[questionNumber][0], cursorPosition[questionNumber][1]);
    $('#textInput').prop('disabled', false).css('color', 'black'); //enable input
    $('#submitButton').attr('value', 'submit'); //Set text for submit button
    $('#answerForm')[0].reset(); //reset form
    $('#checkMark').css('display','none');
    $('#checkPath').removeClass('checked');
    characterMove(); //Move character if necessary
};

//Add motion to character
let characterMove = () => {
    $('#characterArea_character0').animate({left: characterPosition[characterStep]}); //move or stay the character image

};

//reset function
let reset = () => {
    //reset variables
    questionNumber = 0;
    characterStep = 0;
    answerShown = false;
    correctCounter = 0;

    //Reset styles
    $('#answerForm')[0].reset();
    $('#textInput').attr('value', 'e.g. example/index.html').prop('disabled', false).css('color', 'black');
    $('#questionText').text(questions[0]);
    changePosition(pencilPosition[questionNumber][0], pencilPosition[questionNumber][1], cursorPosition[questionNumber][0], cursorPosition[questionNumber][1]);
    $('#characterArea_character0').css({left: characterPosition[0]}).removeClass('jump').attr("src", "images/character_0.png");
    $('#characterArea_character1').css('display', 'inline-block');
    $('#questionArea').css('display', 'block');
    $('#diagramArea').css('display', 'block');
    $('#resultArea').css('display', 'none');
    $('.resultArea_character').css('display', 'none');
    $('#checkMark').css('display','none');
    $('#checkPath').removeClass('checked');
};

//change the positions of both cursor and pencil
let changePosition = (pencilX, pencilY, cursorX, cursorY) => {
    pencilImage.style.left = pencilX + "px";
    pencilImage.style.top = pencilY + "px";
    cursorImage.style.left = cursorX + "px";
    cursorImage.style.top = cursorY + "px";
};
