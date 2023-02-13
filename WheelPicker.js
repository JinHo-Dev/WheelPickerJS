
class WheelPicker {
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
        let dpi = this.dpi;
        let len = this.lists[nth].length;
        let mod = 32 * len;
        let papyrusDOM = this.papyrusDOM[nth];
        let scrollTop = this.scrollTop[nth];
        if(this.infinites[nth] == 1) {
            scrollTop += 96;
            if(scrollTop < 0) {
                scrollTop = (scrollTop % mod) + mod;
            }
            else if(scrollTop > 0) {
                scrollTop %= mod;
            }
            scrollTop -= 96;
            for(let i = 1; scrollTop + 32 + 32 * (i-1) * len < 0; i++) {
                if(papyrusDOM.height <= 32 * dpi + 1 && i == 1) 
                    this.plane.drawImage(papyrusDOM, 0, 0, papyrusDOM.width, papyrusDOM.height, this.boundaries[nth] * dpi, (-scrollTop - 64) * dpi, papyrusDOM.width, 32 * dpi);
                else
                    this.plane.drawImage(papyrusDOM, 0, papyrusDOM.height * i + (scrollTop + 32) * dpi, papyrusDOM.width, (-scrollTop - 32) * dpi, this.boundaries[nth] * dpi, 0, papyrusDOM.width, (-scrollTop - 32) * dpi);
            }
            for(let i = 1; 32*(i-1)*len - scrollTop - 128 < 32; i++) {
                this.plane.drawImage(papyrusDOM, 0, 0, papyrusDOM.width, -i * papyrusDOM.height + (scrollTop + 192) * dpi, this.boundaries[nth] * dpi, i * papyrusDOM.height - (scrollTop + 32) * dpi, papyrusDOM.width, -i * papyrusDOM.height + (scrollTop + 192) * dpi);
            }
        }
        let margin = (scrollTop + 32) * dpi;
        if(margin < 0) {
            this.plane.drawImage(papyrusDOM, 0, 0, papyrusDOM.width, this.HEIGHT, this.boundaries[nth] * dpi, -margin, papyrusDOM.width, this.HEIGHT);
        }
        else {
            this.plane.drawImage(papyrusDOM, 0, margin, papyrusDOM.width, this.HEIGHT, this.boundaries[nth] * dpi, 0, papyrusDOM.width, this.HEIGHT);
        }
    }
    roll(nth) {
        const left = this.boundaries[nth];
        const right = this.boundaries[nth+1];
        const LEFT = Math.round(left * this.dpi);
        const RIGHT = Math.round(right * this.dpi);

        this.linen.clearRect(LEFT, 0, RIGHT-LEFT, this.HEIGHT);
        this.circular.clearRect(LEFT, 0, RIGHT-LEFT, this.HEIGHT);
        let visited = new Array(this.HEIGHT);
        for(let y = 0; y < this.HEIGHT; y++) {
            let fny = this.fn[y];
            let Y = Math.round(this.HEIGHT/2 + (fny*0.2+0.8) * (y-this.HEIGHT/2));
            if(visited[Y] == 1) {
                continue;
            }
            else if(Y < this.dpi * 96 && Y > this.dpi * 64) {
                continue;
            }
            else {
                visited[Y] = 1;
            }
            let X = Math.round( (this.WIDTH/2) + (fny*0.05+0.95)*(LEFT-this.WIDTH/2) );
            let X1 = Math.round( (this.WIDTH/2) + (fny*0.05+0.95)*(RIGHT-this.WIDTH/2) );
            let Z = fny * 0.4;
            this.linen.globalAlpha = Z;
            this.linen.drawImage(this.planeDOM, LEFT, y, RIGHT-LEFT, 1, X, Y, X1 - X, 1);
        }
        this.linen.globalAlpha = 1;
        this.linen.drawImage(this.planeDOM, LEFT, 64 * this.dpi, RIGHT-LEFT, 32 * this.dpi, LEFT, 64 * this.dpi, RIGHT-LEFT, 32 * this.dpi);
        if(this.background.split(",")[0].split("(")[1] > 140) {
            this.linen.fillStyle = "rgba(0,0,10,0.3)";
        }
        else {
            this.linen.fillStyle = "rgba(255,255,255,0.3)";
        }
        this.linen.fillRect(LEFT, Math.round(64 * this.dpi), RIGHT-LEFT, 1);
        this.linen.fillRect(LEFT, Math.round(96 * this.dpi - 1), RIGHT-LEFT, 1);
        this.circular.drawImage(this.linenDOM, LEFT, 0, RIGHT-LEFT, this.HEIGHT, LEFT, 0, RIGHT-LEFT, this.HEIGHT);
    }
    constructor(parent) {
        this.parent = parent;
        this.timeNpos = [[0,0],[0,0]];
        let selectDOMs = parent.getElementsByTagName("select");
        this.selectDOMs = selectDOMs;
        this.lists = new Array(selectDOMs.length);
        this.interv = new Array(selectDOMs.length);
        this.lastTime = new Array(selectDOMs.length);
        this.accel = 333;
        this.selecteds = new Array(selectDOMs.length);
        this.infinites = new Array(selectDOMs.length);
        for(let i = 0; i < selectDOMs.length; i++) {
            selectDOMs[i].addEventListener("change", function(e) {
                let o = e.target.closest("div").WheelPicker;
                o.selecteds[i] = this.selectedIndex;
                o.scrollTop[i] = o.selecteds[i] * 32 - 96;
                o.draw(i);
            });
            let options = selectDOMs[i].getElementsByTagName("option");
            this.lists[i] = new Array(options.length);
            for(let j = 0; j < options.length; j++) {
                this.lists[i][j] = options[j].innerText;
            }
            selectDOMs[i].style.display = "none";
        }
        this.dpi = window.devicePixelRatio;
        this.scrollTop = new Array(this.lists.length);
        this.width = parent.offsetWidth;
        this.height = 160;
        this.WIDTH = Math.round(this.width * this.dpi);
        this.HEIGHT = Math.round(this.height * this.dpi);
        this.fn = new Array(this.HEIGHT);
        for(var i = 0; i < this.HEIGHT; i++){
            this.fn[i] = Math.sin(Math.PI / 2 * i / this.dpi / 80);
        }
        this.planeDOM = document.createElement("canvas");
        this.plane = this.planeDOM.getContext("2d", {willReadFrequently: false, antialias: false});
        this.planeDOM.width = this.WIDTH;
        this.planeDOM.height = this.HEIGHT;
        this.planeDOM.style.imageRendering = "pixelated";
        this.linenDOM = document.createElement("canvas");
        this.linen = this.linenDOM.getContext("2d", {willReadFrequently: false, antialias: false});
        this.linenDOM.width = this.WIDTH;
        this.linenDOM.height = this.HEIGHT;
        this.linenDOM.style.imageRendering = "pixelated";
        this.circularDOM = document.createElement("canvas");
        parent.appendChild(this.circularDOM);
        this.circular = this.circularDOM.getContext("2d", {willReadFrequently: false, antialias: false});
        this.circularDOM.style.width = this.width + "px";
        this.circularDOM.width = this.WIDTH;
        this.circularDOM.style.height = this.height + "px";
        this.circularDOM.height = this.HEIGHT;
        this.circularDOM.imageSmoothingEnabled = false;
        this.circularDOM.style.imageRendering = "pixelated";
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
        parent.removeChild(this.tDOM);
        x = (this.width - x) / 2;
        for(let i = 0; i < this.boundaries.length; i++) {
            this.boundaries[i] += x;
        }
        this.papyrusDOM = new Array(this.lists.length);
        this.papyrus = new Array(this.lists.length);
        for(let i = 0; i < this.lists.length; i++) {
            this.papyrusDOM[i] = document.createElement("canvas");
            this.papyrus[i] = this.papyrusDOM[i].getContext("2d", {willReadFrequently: false, antialias: false});
            this.papyrusDOM[i].width = Math.round((this.boundaries[i+1]-this.boundaries[i])*this.dpi);
            this.papyrusDOM[i].style.imageRendering = "pixelated";
        }
        let sto;
        parent.addEventListener("wheel", function(e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            let rect = this.getBoundingClientRect();
            this.WheelPicker.scroll(e.clientX - rect.left, e.deltaY / 125 * 32 / 2);
            sto = clearTimeout(sto);
            sto = setTimeout(() => {
                for(let i = 0; i < this.WheelPicker.scrollTop.length; i++) {
                    this.WheelPicker.adj(this.WheelPicker.boundaries[i+1]);
                }
            }, 400);
        });
        this.isClick = 0;
        parent.WheelPicker = this;
        this.reloadAll();
    }
    reloadAll() {
        this.color = window.getComputedStyle(this.parent).color;
        this.background = window.getComputedStyle(this.parent).backgroundColor;
        this.circular.clearRect(Math.round(10*this.dpi), 64 * this.dpi, Math.round(this.WIDTH - 20*this.dpi), 1);
        this.circular.clearRect(Math.round(10*this.dpi), Math.round(96 * this.dpi - 1), Math.round(this.WIDTH - 20*this.dpi), 1);
        if(this.background.split(",")[0].split("(")[1] > 140) {
            this.circular.fillStyle = "rgba(0,0,10,0.3)";
        }
        else {
            this.circular.fillStyle = "rgba(255,255,255,0.3)";
        }
        this.circular.fillRect(Math.round(10*this.dpi), 64 * this.dpi, Math.round(this.WIDTH - 20*this.dpi), 1);
        this.circular.fillRect(Math.round(10*this.dpi), Math.round(96 * this.dpi - 1), Math.round(this.WIDTH - 20*this.dpi), 1);

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
        this.papyrusDOM[nth].height = Math.round(32*this.dpi*this.lists[nth].length);
        this.papyrus[nth].font = `${window.getComputedStyle(this.parent).fontWeight} ${Math.round(22 * this.dpi)}px ${window.getComputedStyle(this.parent).fontFamily}`;
        this.papyrus[nth].textBaseline = "center";
        this.papyrus[nth].fillStyle = this.color;
        this.papyrus[nth].textAlign = "center";
        let t = (this.boundaries[nth+1] - this.boundaries[nth])/2 * this.dpi;
        for(let j = 0; j< this.lists[nth].length; j++) {
            this.papyrus[nth].fillText(this.lists[nth][j], Math.round(t), Math.round((-8 + 32 * j + 32) * this.dpi));
        }
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
    goto(x, cnt) {
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
        let d;
        if(this.infinites[nth] == 0 && this.selecteds[nth] + cnt < 0) {
            d = - 96;
        }
        else if(this.infinites[nth] == 0 && this.selecteds[nth] + cnt >= this.lists[nth].length) {
            d = ((this.lists[nth].length - 1) * 32 - 96);
        }
        else d = ((this.selecteds[nth] + cnt) * 32 - 96);
        d -= this.scrollTop[nth];
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
                let evt = document.createEvent("HTMLEvents");
                evt.initEvent("change", false, true);
                this.selectDOMs[nth].dispatchEvent(evt);
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
                let evt = document.createEvent("HTMLEvents");
                evt.initEvent("change", false, true);
                this.selectDOMs[nth].dispatchEvent(evt);
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
                if(this.scrollTop[nth] < -96 && this.infinites[nth] == 0) velocity = velocity - this.accel * ((-this.scrollTop[nth] - 96) / 2 + 1) * t;
                else velocity = velocity - this.accel * t;
                if(velocity < 0) velocity = 0;
            }
            else if(velocity < 0) {
                this.scrollTop[nth] += -velocity * t;
                this.draw(nth);
                if(this.scrollTop[nth] > this.lists[nth].length * 32 - 128 && this.infinites[nth] == 0) velocity = velocity + this.accel * ((this.scrollTop[nth] - this.lists[nth].length * 32 + 128) / 2 + 1) * t;
                else velocity = velocity + this.accel * t;
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
                this.goto(-1, -2);
            }
            else if(t < 64) {
                this.goto(-1, -1);
            }
            else if(t >= 124) {
                this.goto(-1, 2);
            }
            else if(t >= 96) {
                this.goto(-1, 1);
            }
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

let eventAvailable = false;
async function WheelPickerStart() {
    let doms = document.querySelectorAll(".WheelPicker");
    for(let i = 0; i < doms.length; i++) {
        if(doms[i].WheelPicker) continue;
        doms[i].innerHTML += "<font style='position:absolute;'>&nbsp;</font>";
    }
    if(document.fonts) {
        await document.fonts.ready;
    }
    for(let i = 0; i < doms.length; i++) {
        if(doms[i].WheelPicker) continue;
        new WheelPicker(doms[i]);
    }
    let activeObj;
    if(!eventAvailable) {
        window.addEventListener("mousedown", function(e) {
            let o = e.target.closest("div");
            if(o && o.className=="WheelPicker") {
                e.preventDefault();
                e.stopImmediatePropagation();
                activeObj = o.WheelPicker;
                activeObj.pointerStart(e.clientX, e.clientY);
            }
        });
        window.addEventListener("touchstart", function(e) {
            let o = e.target.closest("div");
            if(o && o.className=="WheelPicker") {
                e.preventDefault();
                e.stopImmediatePropagation();
                activeObj = o.WheelPicker;
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
                activeObj.pointerMove(e.touches[0].clientX, e.touches[0].clientY);
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
}

window.addEventListener("load", WheelPickerStart, false);
