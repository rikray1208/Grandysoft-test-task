import {ILine} from "./ILine";
import {Mouse} from "./Mouse";

export class CanvasModel {
    canvas: HTMLCanvasElement
    context: CanvasRenderingContext2D
    mouse: Mouse = new Mouse()
    firstPoint: number[] = [0,0]
    lines: ILine[] = []

    constructor(canvas: HTMLCanvasElement, canvasContext: CanvasRenderingContext2D) {
        this.canvas = canvas;
        this.context = canvasContext;
        this.addListeners();
        this.updateLines()
    }

    collapse() {
        this.lines.forEach(line => {
            this.collapseAnimation(line)
        })
    }

    collapseAnimation(line: ILine) {

        const k = ((line.y2 - line.y1) / (line.x2 - line.x1));
        const middleX = Number(((line.x2 + line.x1) / 2).toFixed(0));
        const tick = () => {
            const animation = requestAnimationFrame(tick)
            this.clear();

            if (line.x1 > line.x2) {
                const preX1 = line.x1;
                const preY1 = line.y1;
                line.x1 = line.x2;
                line.x2 = preX1
                line.y1 = line.y2;
                line.y2 = preY1
            }

            if (line.x1 !== middleX) {
                line.x1 += 1;
                line.y1 += k;
            }
            if(line.x2 !== middleX) {
                line.x2 -= 1;
                line.y2 -= k;
            }

            this.updateLines();
            this.getIntersection()

            if (line.x1 === middleX && line.x2 === middleX) {
                this.lines = this.lines.filter(el => el !== line)
                cancelAnimationFrame(animation)
            }
        }
        tick()
    }

    addListeners() {
        this.canvas.onmouseup = this.onMouseUp.bind(this);
        this.canvas.onmousedown = this.onMouseDown.bind(this);
        this.canvas.onmousemove = this.onMouseMove.bind(this);
    }

    onMouseUp(e: MouseEvent) {
        if (e.button === 0) {
            this.mouse.pLeft = this.mouse.left;
            this.mouse.left = false;
        }
    }

    onMouseDown(e: MouseEvent) {
        switch (e.button) {
            case 0:
                this.mouse.pLeft = false;
                this.mouse.left = true;
                break;

            case 2:
                this.clear();
                this.updateLines();
                this.getIntersection();
                this.firstPoint = []
                break;
        }
        this.mouse.isFirst = !this.mouse.isFirst;

        if (this.mouse.isFirst && this.mouse.left) {
            this.firstPoint = [e.pageX - this.canvas.offsetLeft, e.pageY - this.canvas.offsetLeft]
        } else {
            const line: ILine = {
                x1: this.firstPoint[0],
                y1: this.firstPoint[1],
                x2: e.pageX - this.canvas.offsetLeft,
                y2: e.pageY - this.canvas.offsetLeft
            }
            this.lines.push(line)
            this.firstPoint = [];
        }
    }
    updateLines() {
        for (let i = 0; i < this.lines.length; i++) {
            this.drawLine(this.lines[i].x1,
                this.lines[i].y1,
                this.lines[i].x2,
                this.lines[i].y2
            );
        }
    }

    onMouseMove(e: MouseEvent) {

        if(this.mouse.pLeft && this.mouse.isFirst) {
            this.clear();
            this.updateLines();
            this.drawLine(
                this.firstPoint[0],
                this.firstPoint[1],
                e.pageX - this.canvas.offsetLeft,
                e.pageY - this.canvas.offsetLeft
            );

            const line: ILine = {
                x1: this.firstPoint[0],
                y1: this.firstPoint[1],
                x2: e.pageX - this.canvas.offsetLeft,
                y2: e.pageY - this.canvas.offsetLeft
            }
            this.lines.push(line)
            this.getIntersection();
            this.lines.pop()
        }

    }

    clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
    }

    getIntersection() {
        for (let i = 0; i < this.lines.length; i++) {
            const line1 = this.lines[i];

            for (let j = i + 1; j < this.lines.length; j++) {
                const line2 = this.lines[j];

                const k1 = (line1.y2 - line1.y1) / (line1.x2 - line1.x1);
                const k2 = (line2.y2 - line2.y1) / (line2.x2 - line2.x1);
                if (k1 === k2) return;

                const b1 = line1.y1 - k1 * line1.x1;
                const b2 = line2.y1 - k2 * line2.x1;

                const x = (b2-b1)/(k1-k2);
                const y = (k1 * (b2 - b1) / (k1 - k2)) + b1;

                const firstCondition = (x < line1.x2  && line1.x1 < x) || (x < line1.x1  && line1.x2 < x);
                const secondCondition = (x < line2.x2  && line2.x1 < x) || (x < line2.x1  && line2.x2 < x);

                if( firstCondition && secondCondition ) {
                    this.drawIntersection(x, y);
                }
            }
        }

    }

    drawIntersection(x: number, y: number) {
        this.context.beginPath();
        this.context.fillStyle = 'red';
        this.context.arc(x, y, 4, 0, Math.PI * 2)
        this.context.fill();
        this.context.stroke();
        this.context.closePath();
    }

    drawLine(startX: number, startY: number, endX: number, endY: number) {
        this.context.beginPath();
        this.context.moveTo(startX, startY);
        this.context.lineTo(endX, endY);
        this.context.stroke()
        this.context.closePath();
    }
}
