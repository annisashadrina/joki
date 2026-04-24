document.addEventListener('DOMContentLoaded', () => {
    
    // ======== DRAGGABLE LOGIC ========
    const draggables = document.querySelectorAll('.draggable');
    let activeElement = null;
    let initialX = 0;
    let initialY = 0;
    let xOffset = 0;
    let yOffset = 0;

    // We store the original transform (like rotation) so we can preserve it during drag
    draggables.forEach(el => {
        // Read initial rotate if defined in inline style
        const transform = el.style.transform;
        if (transform.includes('rotate')) {
            const rot = transform.match(/rotate\(([^)]+)\)/)[0];
            el.dataset.rotate = rot;
        } else {
            el.dataset.rotate = 'rotate(0deg)';
        }

        el.addEventListener('mousedown', dragStart);
        
        // Touch support
        el.addEventListener('touchstart', dragStart, { passive: false });
    });

    document.addEventListener('mouseup', dragEnd);
    document.addEventListener('mousemove', drag);
    
    // Touch support for document body
    document.addEventListener('touchend', dragEnd);
    document.addEventListener('touchmove', drag, { passive: false });

    function dragStart(e) {
        // If clicking on the folder, we might want to let the click through, 
        // but let's allow drag anyway. 
        activeElement = this;
        
        // Bring to front
        draggables.forEach(el => el.style.zIndex = el === activeElement ? '1000' : (el.style.zIndex === '1000' ? '10' : el.style.zIndex));
        
        if (e.type === "touchstart") {
            initialX = e.touches[0].clientX - xOffset;
            initialY = e.touches[0].touches[0] ? e.touches[0].touches[0].clientY - yOffset : e.touches[0].clientY - yOffset;
        } else {
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
        }
    }

    function drag(e) {
        if (activeElement) {
            e.preventDefault(); // prevent selecting text

            let currentX, currentY;

            if (e.type === "touchmove") {
                currentX = e.touches[0].clientX - initialX;
                currentY = e.touches[0].clientY - initialY;
            } else {
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
            }

            // Using inline styling to move the element.
            // Since we rely on left/top in CSS, we adjust `left` and `top`.
            // Wait, we can animate transform for better performance.
            
            // Actually, an easier way is to just adjust top and left directly
            if (e.type === "touchmove") {
                activeElement.style.left = (e.touches[0].clientX - activeElement.offsetWidth / 2) + "px";
                activeElement.style.top = (e.touches[0].clientY - activeElement.offsetHeight / 2) + "px";
            } else {
                activeElement.style.left = (e.clientX - activeElement.offsetWidth / 2) + "px";
                activeElement.style.top = (e.clientY - activeElement.offsetHeight / 2) + "px";
            }
        }
    }

    function dragEnd(e) {
        initialX = currentX;
        initialY = currentY;
        activeElement = null;
    }
    
    // Wait, the drag function above doesn't perfectly maintain offset. Let's write a better dragging logic.
    let isDragging = false;
    let currentX;
    let currentY;

// Proper dragging logic
let draggedElement = null;
let offsetX = 0;
let offsetY = 0;

document.querySelectorAll('.draggable').forEach(elem => {
    elem.addEventListener('mousedown', function(e) {
        // Prevent default only if not an interactive child (like linking)
        draggedElement = elem;
        offsetX = e.clientX - elem.getBoundingClientRect().left;
        offsetY = e.clientY - elem.getBoundingClientRect().top;
        
        // bring to front
        let highestZ = 0;
        document.querySelectorAll('.draggable').forEach(node => {
            let z = parseInt(window.getComputedStyle(node).zIndex, 10);
            if (z > highestZ && z !== 'auto') {
                highestZ = z;
            }
        });
        elem.style.zIndex = highestZ + 1;
        elem.style.cursor = 'grabbing';
    });
});

document.addEventListener('mousemove', function(e) {
    if (draggedElement) {
        // preserve the rotate
        let rotate = draggedElement.dataset.rotate || 'rotate(0deg)';
        
        draggedElement.style.left = (e.clientX - offsetX) + 'px';
        draggedElement.style.top = (e.clientY - offsetY) + 'px';
        
        // Ensure margins/transforms stay intact
        // If we use top/left, we just set the transform to the rotated value
        // No need to change the translate since top/left handles positioning.
    }
});

document.addEventListener('mouseup', function() {
    if (draggedElement) {
        draggedElement.style.cursor = 'grab';
        draggedElement = null;
    }
});

    // ======== FOLDER INTERACTION ========
    const mainFolder = document.getElementById('main-folder');
    if (mainFolder) {
        mainFolder.addEventListener('click', (e) => {
            if (Math.abs(offsetX) < 5 && Math.abs(offsetY) < 5) {
                mainFolder.classList.toggle('open');
            }
        });
    }

    // ======== STAGGERED ENTRANCE ANIMATION (Page 1) ========
    const draggablesList = document.querySelectorAll('.draggable');
    draggablesList.forEach((el, index) => {
        el.classList.add('pop-in-anim');
        // Randomize the delay slightly to make it feel organic like items falling on a desk
        const randomDelay = Math.random() * 0.5;
        el.style.animationDelay = `${randomDelay}s`;
    });

    // ======== SCROLL REVEAL ANIMATION (Page 2) ========
    const observerOptions = {
        threshold: 0.2, // Trigger when 20% visible
        rootMargin: "0px 0px -50px 0px"
    };

    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Add staggered delay based on index for smoother cascade
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 100);
                // Optional: Stop observing once revealed
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const scrollElements = document.querySelectorAll('.scroll-animate');
    scrollElements.forEach(el => scrollObserver.observe(el));

    // ======== ABOUT ME MODAL LOGIC ========
    const profileTrigger = document.getElementById('profile-trigger');
    const aboutModal = document.getElementById('about-modal');
    const closeModal = document.getElementById('close-modal');

    if (profileTrigger && aboutModal && closeModal) {
        profileTrigger.addEventListener('click', () => {
            aboutModal.classList.add('active');
        });

        closeModal.addEventListener('click', () => {
            aboutModal.classList.remove('active');
        });

        // Close on outside click
        aboutModal.addEventListener('click', (e) => {
            if (e.target === aboutModal) {
                aboutModal.classList.remove('active');
            }
        });
    }

});
