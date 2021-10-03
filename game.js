let canvas;
let canvasContext;
let moveSpeed = Math.round(1000/120);
let moveFunction;
let matchTime;
let matchFunction;
/* Usando random para sempre gerar uma situação mais engraçada de início. */
let ball = {
    x: 0,
    y: 0,
    speedX: 1,
    speedY: 1,
    accelerationX: 1,
    accelerationY: 1,
}
/* Jogadores */
let p1 = {
    x: 0,
    y: 0,
    sizeX: 10,
    sizeY: 150,
    goals: 0
};
let p2 = {
    x: 10,
    y: 0,
    sizeX: 10,
    sizeY: 150,
    goals: 0
};

function startMatch() {
    canvas = document.querySelector('#game');
    canvas.removeEventListener('click', startMatch);
    canvasContext = canvas.getContext('2d');
    matchTime = 60;
    p1.goals = 0;
    p2.goals = 0;
    /* 
        Primeiro dois números são coordenadas de início X,Y 
        Depois vem a largura e altura, a ideia é definir a área em que o JS considera
        o Canvas.

        Eu posso criar vários elementos com estes dois comandos.
        O último elemento desenhado fica por cima dos outros por padrão.
    */
    /* Fundo */
    canvasContext.fillStyle = 'black';
    canvasContext.fillRect(0, 0, canvas.width, canvas.height);
    gameRestart();
    moveFunction = setInterval(function() { moveBall(); cpuMove(1); drawBoard(); }, moveSpeed);
    matchFunction = setInterval(function() { 
        if(matchTime == 0) {
            clearInterval(matchFunction);
            clearInterval(moveFunction);
            gameRestart();
            endGame();
            canvas.addEventListener('click', startMatch);
        }
        matchTime--;
    }, 1000);
    document.addEventListener('mousemove', function(event) {
        var mousePos = getMousePos(event);
        p1.y = mousePos.y;
    });
}

/*
    To Do:
    - Podemos controlar a reação da CPU conforme a dificuldade (diminuir o campo de visão)

    Nesta função não está sendo utilizado 100% do alcance para limitar contra ataques de extrema velocidade.
    Vide situação dentro de da função de desenho na tela que analisa colisões.
*/
function cpuMove(difficulty) {
    var posCPU = p2.y + (p2.sizeY/2);
    if(posCPU < ball.y-30) {
        p2.y += 3*difficulty;
        /* Validação para o mouse não sair do limite superior. */
        p2.y = (p2.y < 0)?0:p2.y;
    } else if(posCPU > ball.y+30) {
        p2.y -= 3*difficulty;
        p2.y = (p2.y > canvas.height - (p2.sizeY))?(canvas.height - p2.sizeY):p2.y;
    }
}

function endGame() {
    var msg;
    if(p1.goals > p2.goals) {
        msg = "VOCÊ GANHOU"
    } else if(p2.goals > p1.goals) {
        msg = "VOCÊ PERDEU"
    } else {
        msg = "EMPATE";
    }
    canvasContext.fillStyle = 'white';
    canvasContext.textAlign = 'center';
    canvasContext.font = '50px Courier New';
    canvasContext.fillText(msg, canvas.width/2, canvas.height/2 - 15);
}

function getMousePos(event) {
    let rect = canvas.getBoundingClientRect();
    let doc = document.documentElement;
    let mouseX = event.clientX - rect.left - doc.scrollLeft;
    let mouseY = event.clientY - rect.top - doc.scrollTop - 50;
    /* Validação para o mouse não sair do limite superior. */
    mouseY = (mouseY < 0)?0:mouseY;
    /* Validação para o mouse não sair do limite inferior. */
    mouseY = (mouseY > canvas.height - (p1.sizeY))?(canvas.height - p1.sizeY):mouseY;
    mouseX = (mouseX < 0)?0:mouseX;
    return { x: mouseX, y: mouseY };
}

function gameRestart(direction) {
    ball.x = canvas.width/2 - 5;
    ball.y = canvas.height/2 - 5;
    ball.speedX = 1 + Math.random();
    ball.speedY = 1 + Math.random();
    /* Sorteia a direção da bola no eixo vertical. */
    if(Math.round(Math.random()) == 1) {
        ball.speedY = -ball.speedY;
        ball.accelerationY = -ball.accelerationY;
    }
    if(direction) {
        ball.speedX = -ball.speedX;
        ball.accelerationX = -ball.accelerationX;
    }
}

function moveBall() {
    ball.x = ball.x + ball.speedX;
    ball.y = ball.y + ball.speedY;
    if(ball.x > canvas.width || ball.x < 0) {
        ball.speedX = -ball.speedX;
        ball.accelerationX = -ball.accelerationX;
        ball.speedX = ball.speedX + ball.accelerationX;
    }
    if(ball.y > canvas.height || ball.y < 0) {
        ball.speedY = -ball.speedY;
        ball.accelerationY = -ball.accelerationY;
    }
}

function drawBoard() {
    /* Detecção de colisão. */
    if(ball.x < 0) {
        if(ball.y > p1.y && ball.y < p1.y + p1.sizeY) {
            var diffY = ball.y - (p1.sizeY/2 + p1.y);
            //Reduzindo o impacto para evitar extremos de velocidade.
            ball.speedY += diffY * 0.05;
        } else {
            p2.goals++;
            gameRestart(false);
        }
    }
    if(ball.x > canvas.width) {
        if(ball.y > p2.y && ball.y < p2.y + p2.sizeY) {
            var diffY = ball.y - (p2.sizeY/2 + p2.y);
            //Reduzindo o impacto para evitar extremos de velocidade.
            ball.speedY = diffY * 0.2;
        } else {
            p1.goals++;
            gameRestart(true);
        }
    }
    canvasContext.fillStyle = 'black';
    canvasContext.fillRect(0, 0, canvas.width, canvas.height);
    canvasContext.fillStyle = "rgba(255, 255, 255, 0.5)";
    for(i=0;i<canvas.height;i+=50) {
        canvasContext.fillRect(canvas.width/2, i, 2, 20);
    }
    /* Desenhando jogadores */
    canvasContext.fillStyle = 'white';
    canvasContext.fillRect(p1.x, p1.y, p1.sizeX, p1.sizeY);
    canvasContext.fillRect(canvas.width-p2.x, p2.y, p2.sizeX, p2.sizeY);
    /*
        Para desenhar círculos eu preciso invocar o método beginPath
        ele irá permitir o JS calcular o início do nosso objeto (isto serve para polígonos irregulares)
        de forma semelhante a o clip-path do CSS, os 3 últimos parametros são diferentes:
        - Angulo inicial, Angulo Final e o sentido horário/anti (false/true).
    */
    canvasContext.fillStyle = 'red';
    canvasContext.beginPath();
    canvasContext.arc(ball.x, ball.y, 10, 0, Math.PI*2, true);
    canvasContext.fill();
    canvasContext.fillStyle = 'white';
    canvasContext.textAlign = 'center';
    canvasContext.font = '30px Courier New';
    canvasContext.fillText(matchTime, canvas.width/2, 50);
    canvasContext.fillText(p1.goals + " - " + p2.goals, canvas.width/2, 100);
}

window.onload = startMatch;