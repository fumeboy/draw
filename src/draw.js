function Run(canvas, size) {
    this.canvas = null;
    this.init(canvas);
    this.cvs = this.canvas.getContext("2d");
    this.penColor = "#000";//画笔颜色
    this.ifClear = false; // 是否是橡皮擦状态 
    this.boxSize = null;//单个格子大小
    this.size = size;//格子数（边）
    this.gridArr = new Array(this.size*this.size);//画布所有格子，标记有无绘画
    this.distanceX = null;//画布在屏幕中相对位置
    this.distanceY = null;
    this.preX = null;//上一次绘画坐标
    this.preY = null;
    this.start();
    this.click();
    this.touchstart();
    return this
}
Run.prototype.init = function(canvas){
    canvas.innerHTML = "<canvas></canvas>"
    this.canvas = canvas.children[0]
}
Run.prototype.SetColor = function(color){
    if (color){
        this.penColor = color
        this.ifClear = false
    }else{
        this.ifClear = true
    }
}

//计算canvas在屏幕中的位置，进而计算触摸点与canvas的相对位置
Run.prototype.computerWindow = function () {
    this.distanceX = this.canvas.getBoundingClientRect().x;
    this.distanceY = this.canvas.getBoundingClientRect().y;
};
//初始化
Run.prototype.start = function () {
    let cw;
    if (window.innerHeight > window.innerWidth) {
        cw = parseInt(window.innerWidth * 0.85);
    } else {
        cw = parseInt(window.innerHeight * 0.85);
    }
    cw = parseInt(cw / this.size) * this.size;
    this.canvas.width = this.canvas.height = cw;
    this.boxSize = cw / this.size;
    this.computerWindow();
    this.drawBg();
};
//当触摸按下时
Run.prototype.touchstart = function () {
    let move = this.touchmove.bind(this);
    this.canvas.addEventListener("touchstart", function (e) {
        e.preventDefault();
        let dot = e.changedTouches[0];
        let o = this.computedXY(dot.pageX, dot.pageY, true);
        this.beforeDraw(o.re_x, o.re_y);
        this.canvas.addEventListener("touchmove", throttle(move, 5, 20))
    }.bind(this));
    this.canvas.addEventListener("touchend", function () {
        this.canvas.removeEventListener("touchmove", move)
    }.bind(this))
};
//当鼠标按下时
Run.prototype.click = function () {
    let move = this.mousemove.bind(this);
    this.canvas.addEventListener("mousedown", function (e) {
        e.preventDefault();
        let o = this.computedXY(e.offsetX, e.offsetY);
        this.beforeDraw(o.re_x, o.re_y);
        this.canvas.addEventListener("mousemove", move);
    }.bind(this));
    this.canvas.addEventListener("mouseleave", function () {
        this.canvas.removeEventListener("mousemove", move);
    }.bind(this))
    this.canvas.addEventListener("mouseup", function () {
        this.canvas.removeEventListener("mousemove", move);
    }.bind(this))
};
//触摸移动时
Run.prototype.mousemove = function (e) {
    let o = this.computedXY(e.offsetX, e.offsetY);
    if((!o.re_y)||(!o.re_x))return ;
    this.beforeDraw(o.re_x, o.re_y, true)
};
//鼠标移动时
Run.prototype.touchmove = function (e) {
    let dot = e.changedTouches[0];
    let o = this.computedXY(dot.pageX, dot.pageY, true);
    if((!o.re_y)||(!o.re_x))return ;
    if (!(o.re_x === this.preX && o.re_y === this.preY)) this.beforeDraw(o.re_x, o.re_y, true);
};
//根据坐标计算出是在那个格子
Run.prototype.computedXY = function (x, y, z) {
    if (z) {
        x = x - this.distanceX;
        y = y - this.distanceY;
    }
    let temp_x = x;
    let temp_y = y;
    let re_x, re_y;
    for (let i = 0; i < this.size; i++) {
        temp_x = temp_x - this.boxSize;
        if (temp_x < 0) {
            re_x = i;
            break;
        }
    }
    for (let i = 0; i < this.size; i++) {
        temp_y = temp_y - this.boxSize;
        if (temp_y < 0) {
            re_y = i;
            break;
        }
    }
    return {re_x, re_y}
};
//开始画格子之前
Run.prototype.beforeDraw = function (x, y, z) {
    // z 表示处于滑动状态
    // 如果移动得太快，线条会断开
    // 这里的if 多少完善了断线的问题
    if (z && (Math.abs(y - this.preY) + Math.abs(x - this.preX)) > 2) {
        let dx, dy, lenx, leny, tempx, tempy;
        leny = Math.abs(y - this.preY);
        lenx = Math.abs(x - this.preX);
        tempx = this.preX;
        tempy = this.preY;
        if (y > this.preY) {
            dy = 1
        } else {
            dy = -1
        }
        if (x > this.preX) {
            dx = 1
        } else {
            dx = -1
        }
        if (leny > lenx) {
            for (let i = 0; i < leny; i++) {
                tempy = tempy + dy;
                if (lenx > 0) {
                    tempx = tempx + dx;
                    this.drawUnit(tempx , tempy);
                    this.gridArr[tempx + this.size * tempy] = this.ifClear?0:1;
                    lenx--;
                } else {
                    this.drawUnit(tempx , tempy);
                    this.gridArr[tempx + this.size * tempy] = this.ifClear?0:1;
                }
            }
        } else {
            for (let i = 0; i < lenx; i++) {
                tempx = tempx + dx;
                if (leny > 0) {
                    tempy = tempy + dy;
                    this.drawUnit(tempx , tempy);
                    this.gridArr[tempx + this.size * tempy] = this.ifClear?0:1;
                    leny--;
                } else {
                    this.drawUnit(tempx , tempy);
                    this.gridArr[tempx + this.size * tempy] = this.ifClear?0:1;
                }
            }
        }
    } else {
        this.drawUnit(x, y);
        this.gridArr[x + this.size * y] = this.ifClear?0:1;
    }
    this.preX = x;
    this.preY = y;
};

Run.prototype.bg_color = function (i){
    if ((i)%2===0){
        return "#fff";
    }else{
        return "#eee";
    }
}

Run.prototype.drawBg = function () {
    let temp_color = this.penColor;
    for (let i = 0; i < this.size; i++) {
        for (let j = 0; j < this.size; j++) {
            this.penColor = this.bg_color(i+j)
            if(!this.gridArr[i + this.size * j])this.drawUnit(i, j)
        }
    }
    //再切换为画笔颜色
    this.penColor = temp_color;
};

Run.prototype.clearBg = function () {
    for (let i = 0; i < this.size; i++) {
        for (let j = 0; j < this.size; j++) {
            if(!this.gridArr[i + this.size * j])this.cleanUnit(i, j)
        }
    }
};

Run.prototype.drawUnit = function (x, y) {
    let pos_x = x * this.boxSize
    let pos_y = y * this.boxSize
    this.cvs.beginPath();
    this.cvs.fillStyle = this.ifClear?this.bg_color(x+y):this.penColor;
    this.cvs.fillRect(pos_x, pos_y, this.boxSize, this.boxSize);
    this.cvs.fill();
    this.cvs.stroke();
    this.cvs.closePath()
};

Run.prototype.cleanUnit = function (x, y) {
    let pos_x = x * this.boxSize
    let pos_y = y * this.boxSize
    this.cvs.clearRect(pos_x, pos_y, this.boxSize, this.boxSize);
};

Run.prototype.export = function(filename){
    var MIME_TYPE = "image/png";
    this.clearBg()
    var imgURL = this.canvas.toDataURL(MIME_TYPE);

    var dlLink = document.createElement('a');
    dlLink.download = filename;
    dlLink.href = imgURL;
    dlLink.dataset.downloadurl = [MIME_TYPE, dlLink.download, dlLink.href].join(':');
    this.drawBg()
    document.body.appendChild(dlLink);
    dlLink.click();
    document.body.removeChild(dlLink);

}

//一个优化函数，touchmove 和 mousemove 会在移动时很频繁地发生
//用这个函数，让它最多 10（n）ms 进行一次，n 在调用处声明
let throttle = function (fn, delay, mustRunDelay) {
    let timer = null;
    let t_start;
    return function () {
        let context = this, args = arguments, t_curr = +new Date();
        clearTimeout(timer);
        if (!t_start) {
            t_start = t_curr;
        }
        if (t_curr - t_start >= mustRunDelay) {
            fn.apply(context, args);
            t_start = t_curr;
        }
        else {
            timer = setTimeout(function () {
                fn.apply(context, args);
            }, delay);
        }
    };
};

export {Run}