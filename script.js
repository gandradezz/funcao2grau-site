
const form = document.getElementById('form');
const results = document.getElementById('results');
const canvas = document.getElementById('graph');
const ctx = canvas.getContext('2d');
const resetBtn = document.getElementById('resetBtn');

const width = canvas.width;
const height = canvas.height;
const padding = 40;

function clearCanvas() {
    ctx.clearRect(0, 0, width, height);
}

function drawGrid() {
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    const step = 20;

    // Vertical lines
    for(let x = padding; x <= width - padding; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, padding);
        ctx.lineTo(x, height - padding);
        ctx.stroke();
    }
    // Horizontal lines
    for(let y = padding; y <= height - padding; y += step) {
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
    }
}

function mapX(x, xMin, xMax) {
    return padding + ((x - xMin) / (xMax - xMin)) * (width - 2 * padding);
}

function mapY(y, yMin, yMax) {
    return height - padding - ((y - yMin) / (yMax - yMin)) * (height - 2 * padding);
}

function drawAxis(xMin, xMax, yMin, yMax) {
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 2;

    // eixo X (y=0)
    if(yMin < 0 && yMax > 0) {
        const y0 = mapY(0, yMin, yMax);
        ctx.beginPath();
        ctx.moveTo(padding, y0);
        ctx.lineTo(width - padding, y0);
        ctx.stroke();
    }
    // eixo Y (x=0)
    if(xMin < 0 && xMax > 0) {
        const x0 = mapX(0, xMin, xMax);
        ctx.beginPath();
        ctx.moveTo(x0, padding);
        ctx.lineTo(x0, height - padding);
        ctx.stroke();
    }
}

function drawParabola(a, b, c, xMin, xMax, yMin, yMax) {
    ctx.strokeStyle = '#4a00e0';
    ctx.lineWidth = 3;
    ctx.beginPath();

    let first = true;
    for(let x = xMin; x <= xMax; x += 0.01) {
        const y = a*x*x + b*x + c;
        if(y < yMin || y > yMax) continue;

        const cx = mapX(x, xMin, xMax);
        const cy = mapY(y, yMin, yMax);

        if(first) {
            ctx.moveTo(cx, cy);
            first = false;
        } else {
            ctx.lineTo(cx, cy);
        }
    }
    ctx.stroke();
}

function drawPoint(x, y, label, color = 'red') {
    const radius = 5;
    ctx.fillStyle = color;
    const cx = mapX(x, currentXMin, currentXMax);
    const cy = mapY(y, currentYMin, currentYMax);
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, 2*Math.PI);
    ctx.fill();

    ctx.font = '14px Arial';
    ctx.fillText(label, cx + 8, cy - 8);
}

let currentXMin, currentXMax, currentYMin, currentYMax;

form.addEventListener('submit', e => {
    e.preventDefault();

    const a = parseFloat(document.getElementById('a').value);
    const b = parseFloat(document.getElementById('b').value);
    const c = parseFloat(document.getElementById('c').value);

    if(a === 0) {
        results.textContent = 'O coeficiente "a" não pode ser zero para uma função do 2º grau.';
        clearCanvas();
        return;
    }

    // Cálculos
    const delta = b*b - 4*a*c;
    const vertexX = -b/(2*a);
    const vertexY = a*vertexX*vertexX + b*vertexX + c;
    let roots = [];

    if(delta > 0) {
        roots.push((-b + Math.sqrt(delta)) / (2*a));
        roots.push((-b - Math.sqrt(delta)) / (2*a));
    } else if(delta === 0) {
        roots.push(-b/(2*a));
    }

    // Ajustar escala para o gráfico
    currentXMin = vertexX - 10;
    currentXMax = vertexX + 10;

    // Calcular valores Y para ajustar YMin e YMax
    let yValues = [];
    for(let x = currentXMin; x <= currentXMax; x += 0.1) {
        yValues.push(a*x*x + b*x + c);
    }
    currentYMin = Math.min(...yValues) - 5;
    currentYMax = Math.max(...yValues) + 5;

    clearCanvas();

    // Grade
    if(document.getElementById('showGrid').checked) {
        drawGrid();
    }

    drawAxis(currentXMin, currentXMax, currentYMin, currentYMax);
    drawParabola(a, b, c, currentXMin, currentXMax, currentYMin, currentYMax);

    // Mostrar pontos de interesse
    if(document.getElementById('showVertex').checked) {
        drawPoint(vertexX, vertexY, 'Vértice', 'blue');
    }

    if(document.getElementById('showRoots').checked && roots.length > 0) {
        roots.forEach((r, i) => {
            const yRoot = 0;
            drawPoint(r, yRoot, `Raiz ${i+1}`, 'green');
        });
    }

    if(document.getElementById('showAxis').checked) {
        // Eixo de simetria - linha vertical no vértice
        ctx.strokeStyle = 'purple';
        ctx.lineWidth = 1.5;
        const xsym = mapX(vertexX, currentXMin, currentXMax);
        ctx.beginPath();
        ctx.moveTo(xsym, padding);
        ctx.lineTo(xsym, height - padding);
        ctx.stroke();
    }

    if(document.getElementById('showIntersections').checked) {
        // Interseções com eixo Y (x=0)
        const yInt = c;
        drawPoint(0, yInt, 'Interseção Y', 'orange');
    }

    results.innerHTML = `
        <strong>Função:</strong> f(x) = ${a}x² ${b>=0?'+':'-'} ${Math.abs(b)}x ${c>=0?'+':'-'} ${Math.abs(c)}<br/>
        <strong>Delta:</strong> ${delta.toFixed(2)}<br/>
        <strong>Vértice:</strong> (${vertexX.toFixed(2)}, ${vertexY.toFixed(2)})<br/>
        <strong>Raízes:</strong> ${roots.length > 0 ? roots.map(r => r.toFixed(2)).join(', ') : 'Nenhuma real'}
    `;
});

resetBtn.addEventListener('click', () => {
    form.reset();
    results.textContent = '';
    clearCanvas();
});
