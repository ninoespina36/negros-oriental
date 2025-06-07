document.addEventListener('DOMContentLoaded', () => {
	
	gsap.registerPlugin(ScrollTrigger, SplitText);

	/* ScrollTrigger */
	let bodyScrollBar = Scrollbar.init(document.body, {
		damping: 0.1,
		delegateTo: document,
	});
	ScrollTrigger.scrollerProxy(".scroller", {
		scrollTop(value) {
			if (arguments.length) {
				bodyScrollBar.scrollTop = value;
			}
			return bodyScrollBar.scrollTop;
		},
	});
	bodyScrollBar.addListener(ScrollTrigger.update);

	/* Split Text */
	document.fonts.ready.then(() => {
		gsap.set(".split", { opacity: 1 });
		document.querySelectorAll(".split").forEach(splitEl => {
			ScrollTrigger.create({
				trigger: splitEl,
				scroller: ".scroller",
				start: "top 100%",
				once: true,
				onEnter: () => {
					const split = SplitText.create(splitEl, {
						type: "words",
						wordsClass: "word++",
						wordDelimiter: String.fromCharCode(8205)
					});
					gsap.from(split.words, {
						y: -100,
						opacity: 0,
						rotation: "random(-80, 80)",
						stagger: 0.1,
						duration: 1,
						ease: "back"
					});
				}
			});
		});
	});

	

	// Setup sections scrollTrigger
	setupGalleryScroll(".gallery-scroller._1", 'to-right');
	setupGalleryScroll(".gallery-scroller._2", 'to-left');
	setupGalleryScroll(".gallery-scroller-background._1");
	setupGalleryScroll(".gallery-scroller-background._2");

	function setupGalleryScroll(sectionSelector, direction = '') {
		const section = document.querySelector(sectionSelector);
		if (!section) return;

		const images = gsap.utils.toArray(`${sectionSelector} .panel:not(.last)`);
		const allImages = gsap.utils.toArray(`${sectionSelector} .panel`);
		const texts = gsap.utils.toArray(`${sectionSelector} .panel-text`);

		// Set z-index
		gsap.set(images, { zIndex: (i, target, targets) => targets.length - i });
		gsap.set(texts, { zIndex: (i, target, targets) => targets.length - i });

		// Image animations
		images.forEach((image, i) => {
			const directionX = direction === 'to-right' ? (window.outerWidth + 200) : (-window.outerWidth - 200);
			const rotateDeg = direction === 'to-right' ? 45 : -45;

			 const tl = gsap.timeline({
				scrollTrigger: {
					trigger: sectionSelector,
					scroller: ".scroller",
					start: () => "top -" + (window.innerHeight * (i + 0.5)),
					end: () => "+=" + window.innerHeight,
					scrub: true,
					toggleActions: "play none reverse none",
					invalidateOnRefresh: true,
				}
			});

			// Fade in the image behind (next one in the stack)
			if (images[i + 1]) {
				gsap.set(images[i + 1], { opacity: 0 });
				tl.to(images[i + 1], {
					opacity: 1,
					duration: 0.33,
					ease: "power1.inOut",
				});
			}
			
			// For the last image, fade in the last panel text
			if(i === images.length - 1) {
				gsap.set(allImages[allImages.length - 1], { opacity: 0 });
				tl.to(allImages[allImages.length - 1], {
					opacity: 1,
					duration: 0.33,
					ease: "power1.inOut",
				});
			}

			// Fade in current image
			tl.to(image, {
				opacity: direction ? 1 : 0,
				x: ()=> direction ? directionX : 0,
				rotate: ()=> direction ? rotateDeg : 0,
				duration: 0.33,
				ease: "power1.inOut",
			}, "-=0.33");
		});

		// Text animations
		texts.forEach((text, i) => {
			const yValue = window.innerWidth > 991 ? "40%" : "20%";
			gsap.timeline({
				scrollTrigger: {
					trigger: sectionSelector,
					scroller: ".scroller",
					start: () => "top -" + (window.innerHeight * i),
					end: () => "+=" + window.innerHeight,
					scrub: true,
					toggleActions: "play none reverse none",
					invalidateOnRefresh: true,
				}
			})
			.to(text, { duration: 0.33, opacity: 1, y: yValue})
			.to(text, { duration: 0.33, opacity: 0, y: "0%" }, 0.66);
		});

		// Pin section
		ScrollTrigger.create({
			trigger: sectionSelector,
			scroller: ".scroller",
			scrub: true,
			pin: true,
			start: () => "top top",
			end: () => "+=" + ((images.length + 1) * window.innerHeight),
			invalidateOnRefresh: true,
		});
	}

	window.addEventListener('load', () => {
		// Scroll to top first
		bodyScrollBar.scrollTo(0, 0, 0);

		// Small delay ensures the scroll position update is respected
		setTimeout(() => {
			ScrollTrigger.update();  // sync positions
			ScrollTrigger.refresh(); // recalculate triggers
		}, 50);
	});
	window.onbeforeunload = () => {
		window.scrollTo(0, 0);
	}
});