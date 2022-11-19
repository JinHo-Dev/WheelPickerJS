
class LixfloraPicker {
    drawAll() {
        for(let i = 0; i < this.lists.length; i++) {
            this.draw(i);
        }
    }
    draw(nth) {
        const left = this.boundaries[nth];
        const right = this.boundaries[nth+1];
        const LEFT = Math.round(left * this.dpi);
        const RIGHT = Math.round(right * this.dpi);
        this.plane.clearRect(LEFT, 0, RIGHT - LEFT, this.HEIGHT);
        this.write(nth);
        this.roll(nth);
    }
    write(nth) {
        const x = this.boundaries[nth];
        const num = Math.floor((this.scrollTop[nth]) / 32);
        let delta = - (this.scrollTop[nth] - 32 * num);
        if(this.lastNum == num) {
            // this.lastDelta;
        }
        for(let i = 0; i <= 6; i++) {
            let text;
            if(this.lists[nth].length > num + i && num + i >= 0) {
                text = this.lists[nth][num + i];
            }
            else if(this.infinites[nth]) {
                if(this.lists[nth].length <= num + i) {
                    text = this.lists[nth][(num + i)%this.lists[nth].length];
                }
                else {
                    for(let j = 1; 1; j++) {
                        if(num + i + j*this.lists[nth].length >= 0) {
                            text = this.lists[nth][num + i + j*this.lists[nth].length];
                            break;
                        }
                    }
                }
            }
            else {
                text = '';
            }
            this.plane.font = Math.round(22 * this.dpi) +"px sans-serif";
            this.plane.fillStyle = "rgb(0, 0, 0)";
            this.plane.textAlign = "center";
            let t = (this.boundaries[nth+1] + x)/2 * this.dpi;
            this.plane.fillText(text, Math.round(t), Math.round((-8 + 32 * i + delta) * this.dpi));
        }
    }
    roll(nth) {
        const left = this.boundaries[nth];
        const right = this.boundaries[nth+1];
        const LEFT = Math.round(left * this.dpi);
        const RIGHT = Math.round(right * this.dpi);
        let planeData = this.plane.getImageData(LEFT, 0, RIGHT - LEFT, this.HEIGHT);
        let circularData = this.circular.getImageData(LEFT, 0, RIGHT - LEFT, this.HEIGHT);
        let x = 0, y = 0, X, Y, Z;
        let fny = this.fn[0];
        for(let i = 0; 4 * i < circularData.data.length; i++, x++) {
            if(x == RIGHT - LEFT) {
                x = 0;
                y++;
                if(y == this.dpi * 64) {
                    i += (RIGHT - LEFT) * 32 * this.dpi;
                    y += 32 * this.dpi;
                }
                fny = this.fn[y];
                Y = Math.round(this.HEIGHT/2 + (fny*0.2+0.8) * (y-this.HEIGHT/2));
                Z = fny * 0.7;
            }
            // if(planeData.data[4 * i + 3] == 0) continue;
            X = Math.round( (this.WIDTH/2) + (fny*0.05+0.95)*((x+LEFT)-(this.WIDTH/2)) ) - LEFT;
            let I = 4 * ((RIGHT-LEFT)*Y+X);
            circularData.data[I++] = 142;
            circularData.data[I++] = 142;
            circularData.data[I++] = 147;
            circularData.data[I++] = Math.round(Z * planeData.data[4 * i + 3]);
        }
        this.circular.putImageData(circularData, LEFT, 0);
        this.circular.putImageData(this.plane.getImageData(LEFT, 64*this.dpi, RIGHT - LEFT, 32*this.dpi), LEFT, 64 * this.dpi);
    }
    constructor(parent) {
        this.parent = parent;
        this.timeNpos = [[0,0],[0,0]];
        let selectDOMs = parent.getElementsByTagName("select");
        this.selectDOMs = selectDOMs;
        this.lists = new Array(selectDOMs.length);
        this.lists = new Array(selectDOMs.length);
        this.interv = new Array(selectDOMs.length);
        this.lastTime = new Array(selectDOMs.length);
        this.accel = 333;
        this.selecteds = new Array(selectDOMs.length);
        this.infinites = new Array(selectDOMs.length);
        for(let i = 0; i < selectDOMs.length; i++) {
            selectDOMs[i].addEventListener("change", function(e) {
                let o = e.target.closest("div").LixfloraPicker;
                o.selecteds[i] = this.selectedIndex;
                o.scrollTop[i] = o.selecteds[i] * 32 - 96;
                o.draw(i);
            });
            this.selecteds[i] = selectDOMs[i].selectedIndex;
            if(selectDOMs[i].getAttribute("infinite") != null) this.infinites[i] = 1;
            else this.infinites[i] = 0;
            let options = selectDOMs[i].getElementsByTagName("option");
            this.lists[i] = new Array(options.length);
            for(let j = 0; j < options.length; j++) {
                this.lists[i][j] = options[j].innerText;
            }
            selectDOMs[i].style.display = "none";
        }
        this.dpi = window.devicePixelRatio;
        this.scrollTop = new Array(this.lists.length);
        for(let i = 0; i < this.lists.length; i++) {
            this.scrollTop[i] = this.selecteds[i] * 32 - 96;
        }
        this.lastNum = Math.floor(this.scrollTop / 32);
        this.lastDelta = this.scrollTop % 32;
        this.width = parent.offsetWidth;
        this.height = 160;
        this.WIDTH = Math.round(this.width * this.dpi);
        this.HEIGHT = Math.round(this.height * this.dpi);
        this.fn = new Array(this.HEIGHT);
        for(var i = 0; i < this.HEIGHT; i++){
            this.fn[i] = Math.sin(Math.PI / 2 * i / this.dpi / 80);
        }
        this.planeDOM = document.createElement("canvas");
        this.plane = this.planeDOM.getContext("2d", {willReadFrequently: true, antialias: false});
        this.circularDOM = document.createElement("canvas");
        parent.appendChild(this.circularDOM);
        this.circular = this.circularDOM.getContext("2d");
        this.planeDOM.style.width = this.width + "px";
        this.planeDOM.width = this.WIDTH;
        this.planeDOM.style.height = this.height + "px";
        this.planeDOM.height = this.HEIGHT;
        this.circularDOM.style.width = this.width + "px";
        this.circularDOM.width = this.WIDTH;
        this.circularDOM.style.height = this.height + "px";
        this.circularDOM.height = this.HEIGHT;
        this.glassDOM = document.createElement("div");
        this.glassDOM.style.width = this.width - 20 + "px";
        this.glassDOM.style.height = "32px";
        this.glassDOM.style.marginTop = "-96px";
        this.glassDOM.style.borderTop = "solid " +(1/this.dpi)+ "px rgba(0,0,10,0.3)";
        this.glassDOM.style.borderBottom = "solid " +(1/this.dpi)+ "px rgba(0,0,10,0.3)";
        this.glassDOM.style.boxSizing = "border-box";
        this.glassDOM.style.marginLeft = "10px";
        this.glassDOM.style.marginRight = "10px";
        parent.appendChild(this.glassDOM);

        this.tDOM = document.createElement("div");
        this.tDOM.style.position = "absolute";
        this.tDOM.style.width = "auto";
        this.tDOM.style.height = "auto";
        this.tDOM.style.visibility = "hidden";
        this.tDOM.style.whiteSpace = "nowrap";
        this.tDOM.style.fontSize = "22px";
        parent.appendChild(this.tDOM);
        this.boundaries = [0];
        let x = 0;
        for(let i = 0; i < this.lists.length; i++) {
            let mx = 0;
            for(let j = 0; j < this.lists[i].length; j++) {
                this.tDOM.innerText = this.lists[i][j];
                mx = Math.max(mx, this.tDOM.clientWidth);
            }
            x += mx + 32;
            this.boundaries.push(x);
        }
        x = (this.width - x) / 2;
        for(let i = 0; i < this.boundaries.length; i++) {
            this.boundaries[i] += x;
        }
        let sto;
        parent.addEventListener("wheel", function(e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            let rect = this.getBoundingClientRect();
            this.LixfloraPicker.scroll(e.clientX - rect.left, e.deltaY / 125 * 32 / 3);
            sto = clearTimeout(sto);
            sto = setTimeout(() => {
                for(let i = 0; i < this.LixfloraPicker.scrollTop.length; i++) {
                    this.LixfloraPicker.adj(this.LixfloraPicker.boundaries[i+1]);
                }
            }, 300);
        });
        this.isClick = 0;
        parent.LixfloraPicker = this;
        this.drawAll();
    }
    reloadAll() {
        for(let i = 0; i < this.lists.length; i++) {
            this.reload(i);
        }
    }
    reload(nth) {
        let selectDOMs = this.parent.getElementsByTagName("select")[nth];
        let options = selectDOMs.getElementsByTagName("option");
        this.infinites[nth] = 0;
        if(selectDOMs.getAttribute("infinite") != null) this.infinites[nth] = 1;
        else this.infinites[nth] = 0;
        this.lists[nth] = new Array(options.length);
        for(let i = 0; i < options.length; i++) {
            this.lists[nth][i] = options[i].innerText;
        }
        this.selecteds[nth] = selectDOMs.selectedIndex;
        this.scrollTop[nth] = this.selecteds[nth] * 32 - 96;
        this.draw(nth);
    }
    setNth(x) {
        let nth = this.boundaries.length - 2;
        for(let i = 1; i < this.boundaries.length; i++) {
            if(this.boundaries[i] >= x) {
                nth = i - 1;
                break;
            }
        }
        this.nth = nth;
    }
    scroll(x, d) {
        let nth;
        if(x == -1) {
            nth = this.nth;
        }
        else {
            nth = this.boundaries.length - 2;
            for(let i = 1; i < this.boundaries.length; i++) {
                if(this.boundaries[i] >= x) {
                    nth = i - 1;
                    break;
                }
            }
        }
        this.scrollTop[nth] += d;
        this.draw(nth);
    }
    goto(x, d) {
        let nth;
        if(x == -1) {
            nth = this.nth;
        }
        else {
            nth = this.boundaries.length - 2;
            for(let i = 1; i < this.boundaries.length; i++) {
                if(this.boundaries[i] >= x) {
                    nth = i - 1;
                    break;
                }
            }
        }
        let c = this.scrollTop[nth];
        this.interv[nth] = clearInterval(this.interv[nth]);
        this.lastTime[nth] = new Date() - 0;
        this.interv[nth] = setInterval(() => {
            let t=(new Date() - this.lastTime[nth]) / 1000;
            if(t <= 0) {t = 0.001;}
            if(t < 0.1) {
                this.scrollTop[nth] = c + d * t * 10;
                this.draw(nth);
            }
            else {
                this.interv[nth] = clearInterval(this.interv[nth]);
                let i = (96 + c + d) / 32;
                i = (this.lists[nth].length + i%this.lists[nth].length)%this.lists[nth].length;
                this.selecteds[nth] = i;
                this.selectDOMs[nth].selectedIndex = i;
                this.scrollTop[nth] = 32 * i - 96;
                this.draw(nth);
            }
        }, 1);
    }
    stop(x) {
        let nth;
        if(x == -1) {
            nth = this.nth;
        }
        else {
            nth = this.boundaries.length - 2;
            for(let i = 1; i < this.boundaries.length; i++) {
                if(this.boundaries[i] >= x) {
                    nth = i - 1;
                    break;
                }
            }
        }
        this.interv[nth] = clearInterval(this.interv[nth]);
    }
    adj(x) {
        let nth;
        if(x == -1) {
            nth = this.nth;
        }
        else {
            nth = this.boundaries.length - 2;
            for(let i = 1; i < this.boundaries.length; i++) {
                if(this.boundaries[i] >= x) {
                    nth = i - 1;
                    break;
                }
            }
        }
        let c = this.scrollTop[nth];
        let d = (32 + (c % 32)) % 32;
        if(d >= 16) d -= 32;
        if(c <= -96 && this.infinites[nth] == 0) d = c + 96;
        if(c >= this.lists[nth].length * 32 - 128 && this.infinites[nth] == 0) d = c - this.lists[nth].length * 32 + 128;
        this.interv[nth] = clearInterval(this.interv[nth]);
        this.lastTime[nth] = new Date() - 0;
        this.interv[nth] = setInterval(() => {
            let t=(new Date() - this.lastTime[nth]) / 1000;
            if(t <= 0) {t = 0.001;}
            if(t < 0.1) {
                this.scrollTop[nth] = c - d * t * 10;
                this.draw(nth);
            }
            else {
                this.interv[nth] = clearInterval(this.interv[nth]);
                let i = (96 + c - d) / 32;
                i = (this.lists[nth].length + i%this.lists[nth].length)%this.lists[nth].length;
                this.selecteds[nth] = i;
                this.selectDOMs[nth].selectedIndex = i;
                this.scrollTop[nth] = 32 * i - 96;
                this.draw(nth);
            }
        }, 1);
    }
    initScroll(x, velocity) {
        let nth;
        if(x == -1) {
            nth = this.nth;
        }
        else {
            nth = this.boundaries.length - 2;
            for(let i = 1; i < this.boundaries.length; i++) {
                if(this.boundaries[i] >= x) {
                    nth = i - 1;
                    break;
                }
            }
        }
        this.lastTime[nth] = new Date() - 0;
        this.interv[nth] = clearInterval(this.interv[nth]);
        this.interv[nth] = setInterval(() => {
            let t=(new Date() - this.lastTime[nth])/1000;
            this.lastTime[nth] = new Date() - 0;
            if(t <= 0) {t = 0.001;}
            if(velocity > 0) {
                this.scrollTop[nth] += -velocity * t;
                this.draw(nth);
                velocity = velocity - this.accel * t;
                if(this.scrollTop[nth] < -96 && this.infinites[nth] == 0) velocity = velocity - this.accel * (-this.scrollTop[nth] - 96) * t;
                if(velocity < 0) velocity = 0;
            }
            else if(velocity < 0) {
                this.scrollTop[nth] += -velocity * t;
                this.draw(nth);
                velocity = velocity + this.accel * t;
                if(this.scrollTop[nth] > this.lists[nth].length * 32 - 128 && this.infinites[nth] == 0) velocity = velocity + this.accel * (this.scrollTop[nth] - this.lists[nth].length * 32 + 128) * t;
                if(velocity > 0) velocity = 0;
            }
            else if(velocity == 0){
                this.interv[nth] = clearInterval(this.interv[nth]);
                this.adj(this.boundaries[nth+1]);
            }
        }, 1);
    }
    pointerStart(x, y) {
        let rect = this.parent.getBoundingClientRect();
        this.setNth(x - rect.left);
        this.timeNpos = [[new Date() - 0, y], [new Date() - 0, y]];
        if(this.interv[this.nth] != undefined) {
            this.stop(-1);
        }
        else {
            this.isClick = 1;
            this.firstX = x;
            this.firstY = y;
        }
    }
    pointerMove(x, y) {
        this.scroll(-1, this.timeNpos[1][1] - y);
        this.timeNpos[0][1] = this.timeNpos[1][1];
        this.timeNpos[1][1] = y;
        this.timeNpos[0][0] = this.timeNpos[1][0];
        this.timeNpos[1][0] = new Date() - 0;
        if((this.firstX - x) * (this.firstX - x) + (this.firstY - y) * (this.firstY - y) > 20) {
            this.isClick = 0;
        }
    }
    pointerEnd() {
        if(this.isClick == 1) {
            let rect = this.parent.getBoundingClientRect();
            if(this.isClick == 0) return;
            let t = this.firstY - rect.top;
            if(t < 36) {
                this.selecteds[this.nth] -= 2;
            }
            else if(t < 64) {
                this.selecteds[this.nth] -= 1;
            }
            else if(t >= 124) {
                this.selecteds[this.nth] += 2;
            }
            else if(t >= 96) {
                this.selecteds[this.nth] += 1;
            }
            if(this.infinites[this.nth] == 0 && this.selecteds[this.nth] < 0) {
                this.selecteds[this.nth] = 0;
            }
            else if(this.infinites[this.nth] == 0 && this.selecteds[this.nth] >= this.lists[this.nth].length) {
                this.selecteds[this.nth] = this.lists[this.nth].length - 1;
            }
            this.selecteds[this.nth] = (this.lists[this.nth].length + this.selecteds[this.nth] % this.lists[this.nth].length) % this.lists[this.nth].length;
            this.goto(-1, (this.selecteds[this.nth] * 32 - 96) - this.scrollTop[this.nth]);
        }
        else {
            let speed;
            if(this.timeNpos[0][0] == this.timeNpos[1][0]) speed = 0;
            else speed = (this.timeNpos[0][1] - this.timeNpos[1][1]) / (this.timeNpos[0][0] - this.timeNpos[1][0]) * 1000;
            if(Math.abs(speed) < 220) {
                this.adj(-1);
            }
            else{
                this.initScroll(-1, Math.max(Math.min(speed, 1000), -1000));
            }
        }
    }
};


function LixfloraPickerStart() {
    let doms = document.querySelectorAll(".LixfloraPicker");
    for(let i = 0; i < doms.length; i++) {
        let o = new LixfloraPicker(doms[i]);
    }

    let activeObj;
    window.addEventListener("mousedown", function(e) {
        let o = e.target.closest("div");
        if(o && o.className=="LixfloraPicker") {
            e.preventDefault();
            e.stopImmediatePropagation();
            activeObj = o.LixfloraPicker;
            activeObj.pointerStart(e.clientX, e.clientY);
        }
    });
    window.addEventListener("touchstart", function(e) {
        let o = e.target.closest("div");
        if(o && o.className=="LixfloraPicker") {
            e.preventDefault();
            e.stopImmediatePropagation();
            activeObj = o.LixfloraPicker;
            activeObj.pointerStart(e.touches[0].clientX, e.touches[0].clientY);
        }
    }, { passive: false });
    window.addEventListener("mousemove", function(e) {
        if(activeObj != null) {
            e.preventDefault();
            e.stopImmediatePropagation();
            activeObj.pointerMove(e.clientX, e.clientY);
        }
    });
    window.addEventListener("touchmove", function(e) {
        if(activeObj != null) {
            e.preventDefault();
            e.stopImmediatePropagation();
            activeObj.pointerMove(e.touches[0].clientY);
        }
    }, { passive: false });
    window.addEventListener("mouseup", function(e) {
        if(activeObj != null) {
            e.preventDefault();
            e.stopImmediatePropagation();
            activeObj.pointerEnd();
            activeObj = null;
        }
    });
    window.addEventListener("touchend", function(e) {
        if(activeObj != null) {
            e.preventDefault();
            e.stopImmediatePropagation();
            activeObj.pointerEnd();
            activeObj = null;
        }
    });
}
