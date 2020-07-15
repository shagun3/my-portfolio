window.onload = function() {
	const HASH_LINKS = document.querySelectorAll("a[href^='#']");
	const NAV_LINKS = Array.from(document.getElementsByClassName("nav-link"));
	const BRK_POINTS = Array.from(document.getElementsByClassName('breakpoint'));
	const NAV_HEIGHT = document.getElementsByClassName("fixed-top")[0].offsetHeight; 
	let scrollDistances = [];
	NAV_LINKS[0].classList.add("active");

	function distanceToElement(elem) {
		return Math.floor(elem.getBoundingClientRect().top);
	}

	function smoothScroll(e) {
		e.preventDefault();
		let targetId = this.getAttribute("href");
		let targetSection = document.querySelector(targetId);
		if (!targetSection) return;
		
		let toTop = distanceToElement(targetSection);
		window.scrollBy({ top: toTop, left: 0, behavior: "smooth" });

		let checkIfDone = setInterval(function() {
			let reachedBottom = window.innerHeight + window.pageYOffset >= document.body.offsetHeight;
			let reachedTarget = distanceToElement(targetSection) === 0;
			if (reachedTarget || reachedBottom) {
				targetSection.tabIndex = "-1";
				targetSection.focus();
				window.history.pushState("", "", targetId);
				clearInterval(checkIfDone);
			}
		}, 100); 
	}

	function getDistanceFromDocumentTop(elem) {
			let location = 0;
			if (elem.offsetParent) {
				do {
					location += elem.offsetTop;
					elem = elem.offsetParent;
				} while (elem);
			}
			return location;
	}; 

	function getBreakpoints() {
		//if resize is done, we need to empty the distances array before setting up new breakpoints!!!
		scrollDistances.length = 0; 

		BRK_POINTS.forEach(elem => {
			let targetId = elem.id;
			let distance = getDistanceFromDocumentTop(elem);
			let obj = {};
			obj.id = targetId;
			obj.position = distance;
			scrollDistances.push(obj);
		});
	}

	getBreakpoints();

	function cleanUpMenu() {
		NAV_LINKS.forEach(elem => {
			if (elem.classList.contains("active")) {
				elem.classList.remove("active");
			}
		}); 
	}

	function activateMenuOnScroll() {
		let scrollDistance = window.pageYOffset;
		let scrollLength = scrollDistance + window.innerHeight;
		let totalHeight = document.body.offsetHeight;
	
		cleanUpMenu();
		
		if (scrollDistance < scrollDistances[0].position - NAV_HEIGHT) {
			//Activate Home in menu when scrolled
			NAV_LINKS[0].classList.add("active");
			return;
		} else if (scrollLength >= totalHeight) {
			//Activate Contact in menu when scrolled to the bottom
			NAV_LINKS[NAV_LINKS.length - 1].classList.add("active");
			return;
		}
		
		scrollDistances.forEach(elem => {
			if (scrollDistance >= elem.position - NAV_HEIGHT) {
				cleanUpMenu();
				
				let currentLink = "#" + elem.id;
				let currentNavElem = NAV_LINKS.find(x => x.getAttribute("href") === currentLink);
				currentNavElem.classList.add("active");
			}
		});
	}

	function debounce(func, delay = 40) {
		let timer;
		return function() {
			let context = this;
			let args = arguments;
			let funcToDelay = function() {
				func.apply(context, args);
			};
			clearTimeout(timer);
			timer = setTimeout(funcToDelay, delay);
		};	
	}

	HASH_LINKS.forEach(linkElem => {
		//for the two carousel buttons (right/ left), it should not scroll anywhere when user clicks on them
		if (linkElem.getAttribute("href") === "#PGCarousel") return;
		linkElem.addEventListener("click", smoothScroll);
	});

	document.addEventListener("scroll", debounce(activateMenuOnScroll));
	window.addEventListener("resize", debounce(getBreakpoints, 500));
};


