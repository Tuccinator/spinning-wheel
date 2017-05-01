(function() {
    window.Wheel = {
        init: function(id, options) {
            // add the container
            Wheel.container = document.getElementById(id);

            // initialize all additional options
            Wheel.options = {};
            Wheel.options.id = id;
            Wheel.options.items =  options.items || 30;
            Wheel.options.className = options.className || Wheel.options.id + '-item';
            Wheel.options.duration = options.duration || 5000;
        },

        spin: function() {
            // add the inner wheel for holding the items
            var inner = document.createElement('div');
            inner.setAttribute('id', Wheel.options.id + '-inner');
            Wheel.container.appendChild(inner);

            // add the needle for the wheel
            var needle = document.createElement('div');
            needle.setAttribute('id', Wheel.options.id + '-needle');
            Wheel.container.appendChild(needle);

            // add all of the items
            for(var i = 1; i <= Wheel.options.items; i++) {
                var tile = document.createElement('div');
                tile.className = Wheel.options.className;
                tile.textContent = i;
                inner.appendChild(tile);
            }

            // spin the wheel
            setTimeout(function() {
                Velocity(document.getElementById(Wheel.options.id + '-inner'), {
                    translateX: "-500px",
                }, {
                    duration: Wheel.options.duration,
                    easing: [.6, .4, .3, 1],
                });
            }, 1000);
        }
    };
})();