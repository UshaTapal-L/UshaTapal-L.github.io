(function () {
	var root = document.documentElement;
	root.classList.add('js');

	// Current year in footer
	var year = document.getElementById('year');
	if (year) year.textContent = new Date().getFullYear();

	// Nav border once the page scrolls
	var nav = document.querySelector('.nav');
	function onScroll() { nav.classList.toggle('is-scrolled', window.scrollY > 8); }
	window.addEventListener('scroll', onScroll, { passive: true });
	onScroll();

	// Reveal sections as they enter the viewport
	var items = document.querySelectorAll('.reveal');
	if (!('IntersectionObserver' in window)) {
		items.forEach(function (el) { el.classList.add('is-visible'); });
		return;
	}
	var io = new IntersectionObserver(function (entries) {
		entries.forEach(function (entry) {
			if (entry.isIntersecting) {
				entry.target.classList.add('is-visible');
				io.unobserve(entry.target);
			}
		});
	}, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
	items.forEach(function (el) { io.observe(el); });
})();
