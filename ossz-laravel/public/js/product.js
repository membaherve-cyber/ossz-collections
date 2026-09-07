/* Product page — variant chip picker. */
(function () {
    var picker = document.getElementById('variant-picker');
    var input = document.getElementById('variant-input');
    if (!picker || !input) return;

    picker.addEventListener('click', function (e) {
        var chip = e.target.closest('.chip');
        if (!chip || chip.disabled) return;
        picker.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('chip-active'); });
        chip.classList.add('chip-active');
        input.value = chip.dataset.variant;
    });
})();
