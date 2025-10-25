javascript:(function(){
    if(window.leavesActive){return;}
    window.leavesActive=true;
    const container=document.createElement('div');
    container.style.cssText='position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:999998;overflow:hidden;';
    document.body.appendChild(container);
    const style=document.createElement('style');
    style.textContent=`.autumn-leaf{position:fixed;pointer-events:auto;cursor:pointer;user-select:none;z-index:999999;will-change:transform;}`;
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
    });
    class Leaf{
        constructor(){
            this.element=document.createElement('img');
            this.element.className='autumn-leaf';
            this.element.src=leafImages[Math.floor(Math.random()*leafImages.length)];
            this.element.style.width=(30+Math.random()*40)+'px';
            this.element.draggable=false;
            container.appendChild(this.element);
            this.x=Math.random()*window.innerWidth;
            this.y=-100;
            this.time=0;
            this.velocityY=0.5+Math.random()*1.5;
            this.velocityX=(Math.random()-0.5)*2;
            this.rotation=Math.random()*360;
            this.rotationSpeed=(Math.random()-0.5)*5;
            this.swayAmplitude=20+Math.random()*30;
            this.swaySpeed=0.02+Math.random()*0.03;
            this.swayOffset=Math.random()*Math.PI*2;
            this.isDragging=false;
            this.dragVelocityX=0;
            this.dragVelocityY=0;
            this.lastMouseX=0;
            this.lastMouseY=0;
            this.isResting=false;
            this.restY=0;
            this.restX=0;
            this.friction=0.98;
            this.bounce=0.3;
            this.setupInteraction();
        }
        setupInteraction(){
            this.element.addEventListener('mousedown',(e)=>{
                e.preventDefault();
                this.isDragging=true;
                this.lastMouseX=e.clientX;
                this.lastMouseY=e.clientY;
                this.element.style.cursor='grabbing';
                this.isResting=false;
            });
            document.addEventListener('mousemove',(e)=>{
                if(this.isDragging){
                    this.dragVelocityX=(e.clientX-this.lastMouseX)*0.5;
                    this.dragVelocityY=(e.clientY-this.lastMouseY)*0.5;
                    this.x=e.clientX;
                    this.y=e.clientY;
                    this.lastMouseX=e.clientX;
                    this.lastMouseY=e.clientY;
                    this.isResting=false;
                }
            });
            document.addEventListener('mouseup',()=>{
                if(this.isDragging){
                    this.isDragging=false;
                    this.element.style.cursor='pointer';
                    this.velocityX=this.dragVelocityX*0.5;
                    this.velocityY=this.dragVelocityY*0.5;
                    this.rotationSpeed=(Math.random()-0.5)*15;
                }
            });
            this.element.addEventListener('click',(e)=>{
                if(!this.isDragging){
                    this.velocityY=-8-Math.random()*4;
                    this.velocityX=(Math.random()-0.5)*6;
                    this.rotationSpeed=(Math.random()-0.5)*15;
                    this.isResting=false;
                }
            });
        }
        checkMouseInteraction(){
            const dx=this.x-mouse.x;
            const dy=this.y-mouse.y;
            const distance=Math.sqrt(dx*dx+dy*dy);
            const interactionRadius=60;
            if(distance<interactionRadius){
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
            if(!this.isDragging){
                this.time+=0.016;
                if(!this.isResting){
                    this.velocityY+=0.08;
                    this.velocityY=Math.min(this.velocityY,4);
                    const sway=Math.sin(this.time*this.swaySpeed+this.swayOffset)*this.swayAmplitude*0.1;
                    this.x+=this.velocityX+sway;
                    this.y+=this.velocityY;
                    this.velocityX*=this.friction;
                    this.rotation+=this.rotationSpeed;
                    this.rotationSpeed*=0.97;
                    const groundY=window.innerHeight-(this.element.height?this.element.height*0.7:20);
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
                    if(this.x<-50){
                        this.x=-50;
                        this.velocityX*=-0.5;
                    }
                    if(this.x>window.innerWidth+50){
                        this.x=window.innerWidth+50;
                        this.velocityX*=-0.5;
                    }
                }else{
                    this.x=this.restX;
                    this.y=this.restY;
                    this.rotation+=this.rotationSpeed;
                    this.rotationSpeed*=0.95;
                }
            }else{
                this.dragVelocityX*=0.95;
                this.dragVelocityY*=0.95;
            }
            const wobble=this.isResting?Math.sin(this.time)*2:Math.sin(this.time*2)*10;
            this.element.style.transform=`translate(${this.x}px,${this.y}px) rotate(${this.rotation+wobble}deg)`;
        }
    }
    function animate(){
        leaves.forEach(leaf=>leaf.update());
        requestAnimationFrame(animate);
    }
    for(let i=0;i<100;i++){
        setTimeout(()=>{leaves.push(new Leaf());},i*50);
    }
    animate();
    const removeBtn=document.createElement('button');
    removeBtn.textContent='clear + exit';
    removeBtn.style.cssText='position:fixed;top:10px;right:10px;z-index:9999999;padding:10px 20px;background:#8B4513;color:white;border:none;border-radius:5px;cursor:pointer;font-weight:bold;box-shadow:0 2px 10px rgba(0,0,0,0.3);';
    removeBtn.onclick=()=>{
        leaves.forEach(leaf=>leaf.element.remove());
        removeBtn.remove();
        style.remove();
        container.remove();
        window.leavesActive=false;
    };
    document.body.appendChild(removeBtn);
})();
