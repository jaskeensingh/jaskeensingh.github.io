(function(){
    const canvas = document.getElementById('particle-canvas');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');

    let w = canvas.width = innerWidth;
    let h = canvas.height = innerHeight;

    const DPR = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = w * DPR; canvas.height = h * DPR; canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    ctx.scale(DPR, DPR);

    const PARTICLE_DENSITY = 0.00015;
    const BASE_COUNT = Math.floor(w * h * PARTICLE_DENSITY);
    const particles = [];
    const linkDistance = 140;
    const cursorInfluence = 160;
    const cursor = { x: -9999, y: -9999, active:false };
    let lastScrollY = window.scrollY;
    let scrollVelocity = 0;

    function rand(min,max){ return Math.random()*(max-min)+min; }

    function createParticle(){
        return {
            x: Math.random()*w,
            y: Math.random()*h,
            vx: rand(-0.25,0.25),
            vy: rand(-0.25,0.25),
            r: rand(1.2,2.2),
            baseSpeed: rand(0.15,0.35)
        };
    }

    for(let i=0;i<BASE_COUNT;i++) particles.push(createParticle());

    function resize(){
        w = innerWidth; h = innerHeight;
        canvas.width = w * DPR; canvas.height = h * DPR; canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
        ctx.setTransform(1,0,0,1,0,0);
        ctx.scale(DPR,DPR);
        
        const target = Math.floor(w*h*PARTICLE_DENSITY);
        if(target > particles.length){
                for(let i=particles.length;i<target;i++) particles.push(createParticle());
        } else if(target < particles.length){
            particles.length = target;
        }
    }
    window.addEventListener('resize', resize);

    window.addEventListener('mousemove', e => {
        cursor.x = e.clientX; cursor.y = e.clientY; cursor.active = true;
    });
    window.addEventListener('mouseleave', () => cursor.active=false);
    window.addEventListener('touchmove', e => {
        const t = e.touches[0];
        cursor.x = t.clientX; cursor.y = t.clientY; cursor.active = true;
    }, {passive:true});
    window.addEventListener('touchend', ()=> cursor.active=false);

    window.addEventListener('scroll', () => {
            const y = window.scrollY;
            scrollVelocity = (y - lastScrollY);
            lastScrollY = y;
    }, {passive:true});

    let hidden = false;
    document.addEventListener('visibilitychange',()=>{ hidden = document.hidden; });

    function step(){
        if(hidden){
            requestAnimationFrame(step);
            return;
        }
        ctx.clearRect(0,0,w,h);
        scrollVelocity *= 0.90;
        
        const cellSize = 90;
        const grid = new Map();
        function cellKey(x,y){
            return ((x/cellSize)|0)+','+((y/cellSize)|0);
        }
        
        for(let p of particles){
            p.vy += (scrollVelocity * 0.0005);
            p.vx *= 0.995; p.vy *= 0.995;
            const sp = p.baseSpeed;
            p.x += p.vx + sp * 0.6;
            p.y += p.vy + sp * 0.2;
            if(p.x > w+20) p.x = -20; else if(p.x < -20) p.x = w+20;
            if(p.y > h+20) p.y = -20; else if(p.y < -20) p.y = h+20;
            if(cursor.active){
                const dx = p.x - cursor.x; const dy = p.y - cursor.y; const dist = Math.hypot(dx,dy);
                if(dist < cursorInfluence){
                    const force = (cursorInfluence - dist)/cursorInfluence;
                    p.vx += (dx/dist || 0) * force * 0.05;
                    p.vy += (dy/dist || 0) * force * 0.05;
                }
            }
            const key = cellKey(p.x,p.y);
            if(!grid.has(key)) grid.set(key,[]);
            grid.get(key).push(p);
        }
        
        ctx.lineWidth = 1;
        for(let [key, bucket] of grid){
            const [cx,cy] = key.split(',').map(Number);
            const neighbors = [];
            for(let ox=-1; ox<=1; ox++){
                for(let oy=-1; oy<=1; oy++){
                    const nk = (cx+ox)+','+(cy+oy);
                    if(grid.has(nk)) neighbors.push(...grid.get(nk));
                }
            }
            for(let i=0;i<bucket.length;i++){
                const a = bucket[i];
                let alpha = 0.6;
                let glowFactor = 0;
                if(cursor.active){
                    const dc = Math.hypot(a.x-cursor.x,a.y-cursor.y);
                    if(dc < cursorInfluence){
                        alpha = 1 - (dc/cursorInfluence)*0.7;
                        glowFactor = 1 - dc/cursorInfluence;
                    }
                }
                if(glowFactor>0.05){
                    ctx.save();
                    ctx.shadowBlur = 12 * glowFactor + 3;
                    ctx.shadowColor = `rgba(255,255,255,${0.4 + glowFactor*0.5})`;
                    ctx.fillStyle = `rgba(200,200,200,${alpha})`;
                    ctx.beginPath(); ctx.arc(a.x,a.y,a.r + glowFactor*0.8,0,Math.PI*2); ctx.fill();
                    ctx.restore();
                } else {
                    ctx.fillStyle = `rgba(167,167,167,${alpha})`;
                    ctx.beginPath(); ctx.arc(a.x,a.y,a.r,0,Math.PI*2); ctx.fill();
                }
                for(let b of neighbors){
                    if(a===b) continue;
                        const dx = a.x-b.x; const dy = a.y-b.y; const d2 = dx*dx+dy*dy;
                        if(d2 < linkDistance*linkDistance){
                            const d = Math.sqrt(d2); let opacity = 1 - d / linkDistance; let lineGlow = 0;
                            if(cursor.active){
                                const mx = (a.x + b.x)/2, my = (a.y + b.y)/2;
                                const dc = Math.hypot(mx-cursor.x,my-cursor.y);
                                if(dc < cursorInfluence){
                                    boost = 0.4*(1-dc/cursorInfluence);
                                    opacity = Math.min(1, opacity + boost);
                                    lineGlow = 1 - dc/cursorInfluence;
                                }
                            }
                            ctx.strokeStyle = `rgba(167,167,167,${opacity*0.5})`;
                            if(lineGlow>0.05){
                                ctx.save();
                                ctx.shadowBlur = 18 * lineGlow + 2;
                                ctx.shadowColor = `rgba(255,255,255,${0.25 + lineGlow*0.45})`;
                                ctx.lineWidth = 1.2 + lineGlow*0.6;
                                ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
                                ctx.restore();
                            } else {
                                ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
                            }
                        }
                    }
                }
            }
            requestAnimationFrame(step);
        }
        step();
    }
)();