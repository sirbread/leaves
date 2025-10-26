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
    style.textContent=`.autumn-leaf{position:fixed;pointer-events:auto;cursor:pointer;user-select:none;z-index:999999;will-change:transform;}
    .hamburger-menu{position:fixed;top:10px;right:10px;z-index:10000000;font-family:Arial,sans-serif;}
    .hamburger-btn{width:50px;height:50px;background:#8B4513;border:none;border-radius:8px;cursor:pointer;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:6px;padding:0;box-shadow:0 2px 10px rgba(0,0,0,0.3);transition:transform 0.2s;}
    .hamburger-btn:hover{transform:scale(1.05);}
    .hamburger-line{width:30px;height:3px;background:white;border-radius:2px;}
    .menu-panel{position:absolute;top:60px;right:0;width:280px;background:white;border-radius:8px;box-shadow:0 4px 20px rgba(0,0,0,0.3);padding:20px;display:none;flex-direction:column;gap:15px;}
    .menu-panel.open{display:flex;}
    .menu-item{display:flex;flex-direction:column;gap:8px;}
    .menu-item label{font-weight:bold;color:#333;font-size:14px;}
    .menu-item input[type="range"]{width:100%;cursor:pointer;}
    .menu-item .value-display{color:#666;font-size:13px;}
    .menu-btn{padding:12px;background:#8B4513;color:white;border:none;border-radius:5px;cursor:pointer;font-weight:bold;font-size:14px;transition:background 0.2s;}
    .menu-btn:hover{background:#a0522d;}`;
    document.head.appendChild(style);
    const leaves=[];
    const leafImages=['https://hc-cdn.hel1.your-objectstorage.com/s/v3/c0cfd076523a1494b43f3deff2b3d7e012c892a4_image.png'];
    const mouse={x:0,y:0,prevX:0,prevY:0,speedX:0,speedY:0};
    document.addEventListener('mousemove',(e)=>{
        mouse.prevX=mouse.x;
        mouse.prevY=mouse.y;
        mouse.x=e.clientX;
        mouse.y=e.clientY;
        mouse.speedX=(mouse.x-mouse.prevX)*0.5;
        mouse.speedY=(mouse.y-mouse.prevY)*0.5;
        if (Math.abs(mouse.x - mouse.prevX) > 50 || Math.abs(mouse.y - mouse.prevY) > 50) {
            mouse.speedX = 0;
            mouse.speedY = 0;
        }
    });
    
    class Leaf{
        constructor(){
            this.element=document.createElement('img');
            this.element.className='autumn-leaf';
            this.element.src=leafImages[Math.floor(Math.random()*leafImages.length)];
            this.leafWidth=30+Math.random()*40;
            this.element.style.width=this.leafWidth+'px';
            this.element.draggable=false;
            container.appendChild(this.element);
            this.x=Math.random()*window.innerWidth;
            this.y=-100;
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
        update(){
            this.checkMouseInteraction();
            this.time+=0.016;
            if(!this.isResting){
                this.velocityY+=0.05;
                this.velocityY=Math.min(this.velocityY,2);
                const sway1=Math.sin(this.time*this.swaySpeed+this.swayOffset)*this.swayAmplitude*0.05;
                const sway2=Math.sin(this.time*this.swaySpeed2+this.swayOffset2)*this.swayAmplitude2*0.03;
                const totalSway=sway1+sway2;
                this.x+=this.velocityX+totalSway;
                this.y+=this.velocityY;
                this.velocityX*=this.friction;
                this.rotation+=this.rotationSpeed+(totalSway*0.5);
                this.rotationSpeed*=0.98;
                const groundY=window.innerHeight-(this.leafWidth*0.7);
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
                    this.x=barrierWidth;
                    this.velocityX=Math.abs(this.velocityX)*0.6;
                }
                if(this.x+this.leafWidth>window.innerWidth-barrierWidth){
                    this.x=window.innerWidth-barrierWidth-this.leafWidth;
                    this.velocityX=-Math.abs(this.velocityX)*0.6;
                }
            }else{
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
    leafCountLabel.textContent='Leaf Count';
    const leafCountDisplay=document.createElement('div');
    leafCountDisplay.className='value-display';
    leafCountDisplay.textContent='Current: 100';
    const leafCountSlider=document.createElement('input');
    leafCountSlider.type='range';
    leafCountSlider.min='0';
    leafCountSlider.max='200';
    leafCountSlider.value='100';
    leafCountItem.appendChild(leafCountLabel);
    leafCountItem.appendChild(leafCountDisplay);
    leafCountItem.appendChild(leafCountSlider);

    const clearBtn=document.createElement('button');
    clearBtn.className='menu-btn';
    clearBtn.textContent='Clear + Exit';

    menuPanel.appendChild(leafCountItem);
    menuPanel.appendChild(clearBtn);
    menuContainer.appendChild(hamburgerBtn);
    menuContainer.appendChild(menuPanel);
    document.body.appendChild(menuContainer);

    hamburgerBtn.addEventListener('click',()=>{
        menuPanel.classList.toggle('open');
    });

    leafCountSlider.addEventListener('input',(e)=>{
        const targetCount=parseInt(e.target.value);
        leafCountDisplay.textContent=`Current: ${targetCount}`;

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
