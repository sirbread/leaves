javascript:(function(){
    if(window.leavesActive){return;}
    window.leavesActive=true;
    const container=document.createElement('div');
    container.style.cssText='position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:999998;overflow:hidden;';
    document.body.appendChild(container);
    const leftBarrier=document.createElement('div');
    leftBarrier.style.cssText='position:fixed;top:0;left:0;width:10px;height:100vh;pointer-events:none;z-index:999997;';
    document.body.appendChild(leftBarrier);
    const rightBarrier=document.createElement('div');
    rightBarrier.style.cssText='position:fixed;top:0;right:0;width:10px;height:100vh;pointer-events:none;z-index:999997;';
    document.body.appendChild(rightBarrier);
    const style=document.createElement('style');
    style.textContent=`.autumn-leaf{position:absolute;pointer-events:auto;cursor:pointer;user-select:none;z-index:999999;will-change:transform;}
    .hamburger-menu{position:fixed;top:10px;right:10px;z-index:10000000;font-family:Arial,sans-serif;}
    .hamburger-btn{width:50px;height:50px;background:#8B4513;border:none;border-radius:8px;cursor:pointer;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:6px;padding:0;box-shadow:0 2px 10px rgba(0,0,0,0.3);transition:transform 0.2s;position:relative;}
    .hamburger-btn:hover{transform:scale(1.05);}
    .hamburger-line{width:30px;height:3px;background:white;border-radius:2px;}
    .menu-panel{position:absolute;top:60px;right:0;width:280px;background:white;border-radius:8px;box-shadow:0 4px 20px rgba(0,0,0,0.3);padding:20px;display:none;flex-direction:column;gap:15px;}
    .menu-panel.open{display:flex;}
    .menu-item{display:flex;flex-direction:column;gap:8px;}
    .menu-item label{font-weight:bold;color:#333;font-size:14px;}
    .menu-item input[type="range"]{width:100%;cursor:pointer;}
    .menu-item .value-display{color:#666;font-size:13px;}
    .menu-btn{padding:12px;background:#8B4513;color:white;border:none;border-radius:5px;cursor:pointer;font-weight:bold;font-size:14px;transition:background 0.2s;}
    .menu-btn:hover{background:#a0522d;}
    .menu-btn.active{background:#228B22;}
    .menu-btn.active:hover{background:#2aa02a;}
    .x-line{position:absolute;width:30px;height:3px;background:white;border-radius:2px;top:23px;left:10px;}
    .x1{transform:rotate(45deg);}
    .x2{transform:rotate(-45deg);}
    `;
    document.head.appendChild(style);
    const leaves=[];
    const leafImages=['https://hc-cdn.hel1.your-objectstorage.com/s/v3/c0cfd076523a1494b43f3deff2b3d7e012c892a4_image.png'];
    const mouse={x:0,y:0,prevX:0,prevY:0,speedX:0,speedY:0,scrollY:0};
    const tools={
        rake:false,
        blower:false,
        magnet:false
    };

    let windEnabled=false;
    let windStrength=1.5;

    function getMousePosition(e){
        return {
            x: e.clientX,
            y: e.clientY + window.scrollY
        };
    }
    document.addEventListener('mousemove',(e)=>{
        const pos = getMousePosition(e);
        mouse.prevX=mouse.x;
        mouse.prevY=mouse.y;
        mouse.x=pos.x;
        mouse.y=pos.y;
        mouse.speedX=(mouse.x-mouse.prevX)*0.5;
        mouse.speedY=(mouse.y-mouse.prevY)*0.5;
        if (Math.abs(mouse.x - mouse.prevX) > 50 || Math.abs(mouse.y - mouse.prevY) > 50) {
            mouse.speedX = 0;
            mouse.speedY = 0;
        }
    });

    window.addEventListener('scroll',()=>{
        mouse.scrollY = window.scrollY;
    });

    class Leaf{
        constructor(){
            this.element=document.createElement('img');
            this.element.className='autumn-leaf';
            this.element.src=leafImages[Math.floor(Math.random()*leafImages.length)];
            this.leafWidth=30+Math.random()*40;
            this.element.style.width=this.leafWidth+'px';
            const hue=Math.random()*30;
            this.element.style.filter=`hue-rotate(${hue}deg)`;
            this.element.draggable=false;
            document.body.appendChild(this.element);
            this.x=Math.random()*window.innerWidth;
            this.y=window.scrollY-100;
            this.time=0;
            this.velocityY=0.3+Math.random()*0.5;
            this.velocityX=(Math.random()-0.5)*0.5;
            this.rotation=Math.random()*360;
            this.rotationSpeed=(Math.random()-0.5)*3;
            this.swayAmplitude=40+Math.random()*60;
            this.swaySpeed=0.015+Math.random()*0.02;
            this.swayOffset=Math.random()*Math.PI*2;
            this.swayAmplitude2=20+Math.random()*30;
            this.swaySpeed2=0.025+Math.random()*0.03;
            this.swayOffset2=Math.random()*Math.PI*2;
            this.isDragging=false;
            this.dragVelocityX=0;
            this.dragVelocityY=0;
            this.lastMouseX=0;
            this.lastMouseY=0;
            this.isResting=false;
            this.restY=0;
            this.restX=0;
            this.friction=0.99;
            this.bounce=0.3;
            this.setupInteraction();
        }
        setupInteraction(){
            this.element.addEventListener('click',(e)=>{
                this.velocityY=-8-Math.random()*4;
                this.velocityX=(Math.random()-0.5)*6;
                this.rotationSpeed=(Math.random()-0.5)*15;
                this.isResting=false;
            });
        }
        checkMouseInteraction(){
            const dx=this.x-mouse.x;
            const dy=this.y-mouse.y;
            const distance=Math.sqrt(dx*dx+dy*dy);
            if(tools.magnet){
                const magnetRadius=200;
                if(distance<magnetRadius){
                    const attractionForce=0.5;
                    const angle=Math.atan2(-dy,-dx);
                    this.velocityX+=Math.cos(angle)*attractionForce;
                    this.velocityY+=Math.sin(angle)*attractionForce;
                    this.rotationSpeed+=(Math.random()-0.5)*5;
                    this.isResting=false;
                }
            }
            else if(tools.blower){
                const blowerRadius=150;
                if(distance<blowerRadius){
                    const blowForce=2.5;
                    const angle=Math.atan2(dy,dx);
                    this.velocityX+=Math.cos(angle)*blowForce;
                    this.velocityY+=Math.sin(angle)*blowForce;
                    this.rotationSpeed+=(Math.random()-0.5)*25;
                    this.isResting=false;
                }
            }
            else if(tools.rake){
                const rakeRadius=60;
                if(distance<rakeRadius&&(Math.abs(mouse.speedX)>1||Math.abs(mouse.speedY)>1)){
                    this.velocityX+=mouse.speedX*0.8;
                    this.velocityY+=mouse.speedY*0.8;
                    this.rotationSpeed+=(Math.random()-0.5)*20;
                    this.isResting=false;
                }
            }
            else{
                const cursorRadius=40;
                if(distance<cursorRadius){
                    const mouseSpeed=Math.sqrt(mouse.speedX*mouse.speedX+mouse.speedY*mouse.speedY);
                    const force=Math.max(mouseSpeed*0.8,5);
                    const angle=Math.atan2(dy,dx);
                    const pushX=Math.cos(angle)*force;
                    const pushY=Math.sin(angle)*force;
                    this.velocityX+=pushX;
                    this.velocityY+=pushY-2;
                    this.rotationSpeed+=(Math.random()-0.5)*20;
                    this.isResting=false;
                }
            }
        }
        update(){
            this.checkMouseInteraction();
            this.time+=0.016;
            if(!this.isResting){
                this.velocityY+=0.05;
                this.velocityY=Math.min(this.velocityY,2);
                const sway1=Math.sin(this.time*this.swaySpeed+this.swayOffset)*this.swayAmplitude*0.05;
                const sway2=Math.sin(this.time*this.swaySpeed2+this.swayOffset2)*this.swayAmplitude2*0.03;
                const totalSway=sway1+sway2;
                if(windEnabled){
                    const windForce=-windStrength*(0.8+Math.sin(this.time*0.5+this.swayOffset)*0.2);
                    this.velocityX+=windForce*0.05;
                }
                this.x+=this.velocityX+totalSway;
                this.y+=this.velocityY;
                this.velocityX*=this.friction;
                this.rotation+=this.rotationSpeed+(totalSway*0.5);
                this.rotationSpeed*=0.98;
                const pageHeight=Math.max(
                    document.body.scrollHeight,
                    document.body.offsetHeight,
                    document.documentElement.clientHeight,
                    document.documentElement.scrollHeight,
                    document.documentElement.offsetHeight
                );
                const groundY=pageHeight-(this.leafWidth*0.7);
                if(this.y>=groundY){
                    this.y=groundY;
                    this.velocityY*=-this.bounce;
                    if(Math.abs(this.velocityY)<0.5&&Math.abs(this.velocityX)<0.5){
                        this.isResting=true;
                        this.restY=groundY;
                        this.restX=this.x;
                        this.velocityY=0;
                        this.velocityX=0;
                        this.rotationSpeed*=0.5;
                    }
                }
                const barrierWidth=10;
                if(this.x<barrierWidth){
                    this.x=barrierWidth+1;
                    this.velocityX=2+Math.random()*2.5;
                    this.velocityY=0.3+Math.random()*0.5;
                    this.swayOffset=Math.random()*Math.PI*2;
                    this.swayOffset2=Math.random()*Math.PI*2;
                    this.rotationSpeed=(Math.random()-0.5)*10;
                    this.isResting=false;
                }
                if(this.x+this.leafWidth>window.innerWidth-barrierWidth){
                    this.x=window.innerWidth-barrierWidth-this.leafWidth-1;
                    this.velocityX=-(2+Math.random()*2.5);
                    this.velocityY=0.3+Math.random()*0.5;
                    this.swayOffset=Math.random()*Math.PI*2;
                    this.swayOffset2=Math.random()*Math.PI*2;
                    this.rotationSpeed=(Math.random()-0.5)*10;
                    this.isResting=false;
                }
            }else{
                if(windEnabled){
                    const windPush=-windStrength*(0.8+Math.sin(this.time*0.5+this.swayOffset)*0.2)*0.02;
                    this.restX+=windPush;
                    const barrierWidth=10;
                    if(this.restX<barrierWidth){
                        this.restX=barrierWidth+1;
                        this.isResting=false;
                        this.velocityX=2+Math.random()*2.5;
                        this.velocityY=0.3+Math.random()*0.5;
                    }
                    if(this.restX+this.leafWidth>window.innerWidth-barrierWidth){
                        this.restX=window.innerWidth-barrierWidth-this.leafWidth-1;
                    }
                }

                this.x=this.restX;
                this.y=this.restY;
                this.rotation+=this.rotationSpeed;
                this.rotationSpeed*=0.95;
            }
            const wobble=this.isResting?Math.sin(this.time)*2:Math.sin(this.time*2)*5;
            this.element.style.transform=`translate(${this.x}px,${this.y}px) rotate(${this.rotation+wobble}deg)`;
        }
        remove(){
            this.element.remove();
        }
    }
    function animate(){
        leaves.forEach(leaf=>leaf.update());
        requestAnimationFrame(animate);
    }
    const menuContainer=document.createElement('div');
    menuContainer.className='hamburger-menu';
    const hamburgerBtn=document.createElement('button');
    hamburgerBtn.className='hamburger-btn';
    hamburgerBtn.innerHTML='<div class="hamburger-line"></div><div class="hamburger-line"></div><div class="hamburger-line"></div>';
    const menuPanel=document.createElement('div');
    menuPanel.className='menu-panel';
    const leafCountItem=document.createElement('div');
    leafCountItem.className='menu-item';
    const leafCountLabel=document.createElement('label');
    leafCountLabel.textContent='leaf count';
    const leafCountDisplay=document.createElement('div');
    leafCountDisplay.className='value-display';
    leafCountDisplay.textContent='current: 100';
    const leafCountSlider=document.createElement('input');
    leafCountSlider.type='range';
    leafCountSlider.min='0';
    leafCountSlider.max='200';
    leafCountSlider.value='100';
    leafCountItem.appendChild(leafCountLabel);
    leafCountItem.appendChild(leafCountDisplay);
    leafCountItem.appendChild(leafCountSlider);
    const windItem=document.createElement('div');
    windItem.className='menu-item';
    const windLabel=document.createElement('label');
    windLabel.textContent='Wind Strength';
    const windDisplay=document.createElement('div');
    windDisplay.className='value-display';
    windDisplay.textContent='Off';
    const windSlider=document.createElement('input');
    windSlider.type='range';
    windSlider.min='0';
    windSlider.max='5';
    windSlider.step='0.5';
    windSlider.value='0';
    windItem.appendChild(windLabel);
    windItem.appendChild(windDisplay);
    windItem.appendChild(windSlider);
    const rakeBtn=document.createElement('button');
    rakeBtn.className='menu-btn';
    rakeBtn.textContent='rake';
    const blowerBtn=document.createElement('button');
    blowerBtn.className='menu-btn';
    blowerBtn.textContent='leaf blower';
    const magnetBtn=document.createElement('button');
    magnetBtn.className='menu-btn';
    magnetBtn.textContent='leaf magnet';
    const clearBtn=document.createElement('button');
    clearBtn.className='menu-btn';
    clearBtn.textContent='clear + exit';
    menuPanel.appendChild(leafCountItem);
    menuPanel.appendChild(windItem);
    menuPanel.appendChild(rakeBtn);
    menuPanel.appendChild(blowerBtn);
    menuPanel.appendChild(magnetBtn);
    menuPanel.appendChild(clearBtn);
    menuContainer.appendChild(hamburgerBtn);
    menuContainer.appendChild(menuPanel);
    document.body.appendChild(menuContainer);
    function setHamburgerIcon(open) {
        if (open) {
            hamburgerBtn.innerHTML = '<div class="x-line x1"></div><div class="x-line x2"></div>';
        } else {
            hamburgerBtn.innerHTML = '<div class="hamburger-line"></div><div class="hamburger-line"></div><div class="hamburger-line"></div>';
        }
    }
    function deactivateAllTools(){
        tools.rake=false;
        tools.blower=false;
        tools.magnet=false;
        rakeBtn.classList.remove('active');
        blowerBtn.classList.remove('active');
        magnetBtn.classList.remove('active');
    }
    hamburgerBtn.addEventListener('click',()=>{
        const isOpen = menuPanel.classList.toggle('open');
        setHamburgerIcon(isOpen);
    });
    setHamburgerIcon(false);
    rakeBtn.addEventListener('click',()=>{
        if(tools.rake){
            deactivateAllTools();
        }else{
            deactivateAllTools();
            tools.rake=true;
            rakeBtn.classList.add('active');
        }
    });
    blowerBtn.addEventListener('click',()=>{
        if(tools.blower){
            deactivateAllTools();
        }else{
            deactivateAllTools();
            tools.blower=true;
            blowerBtn.classList.add('active');
        }
    });
    magnetBtn.addEventListener('click',()=>{
        if(tools.magnet){
            deactivateAllTools();
        }else{
            deactivateAllTools();
            tools.magnet=true;
            magnetBtn.classList.add('active');
        }
    });


    leafCountSlider.addEventListener('input',(e)=>{
        const targetCount=parseInt(e.target.value);
        leafCountDisplay.textContent=`current: ${targetCount}`;
        if(targetCount>leaves.length){
            const toAdd=targetCount-leaves.length;
            for(let i=0;i<toAdd;i++){
                setTimeout(()=>{leaves.push(new Leaf());},i*50);
            }
        }else if(targetCount<leaves.length){
            const toRemove=leaves.length-targetCount;
            for(let i=0;i<toRemove;i++){
                const leaf=leaves.pop();
                if(leaf){
                    leaf.remove();
                }
            }
        }
    });
    windSlider.addEventListener('input',(e)=>{
        windStrength=parseFloat(e.target.value);
        if(windStrength===0){
            windEnabled=false;
            windDisplay.textContent='Off';
        }else{
            windEnabled=true;
            windDisplay.textContent=`${windStrength.toFixed(1)}`;
        }
    });
    clearBtn.addEventListener('click',()=>{
        leaves.forEach(leaf=>leaf.remove());
        leaves.length=0;
        menuContainer.remove();
        style.remove();
        container.remove();
        leftBarrier.remove();
        rightBarrier.remove();
        window.leavesActive=false;
    });
    for(let i=0;i<100;i++){
        setTimeout(()=>{leaves.push(new Leaf());},i*50);
    }
    animate();
})();