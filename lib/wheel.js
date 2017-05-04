(function() {
    window.Wheel = {
        calculateCurrentTile: function() {
            var width = Wheel.container.clientWidth;
            var needlePosition = width / 2;

            var currentTile = needlePosition / Wheel.options.width;

            return Math.round(currentTile);
        },

        tilesPerFrame: function() {
            var width = Wheel.container.clientWidth;

            return width / Wheel.options.width;
        },

        wheelOffset: function() {
            var needle = Wheel.container.clientWidth / 2;

            var currentTile = Wheel.calculateCurrentTile();
            var currentTileStart = currentTile * Wheel.options.width;

            var offset = (Wheel.options.width / 2) - (needle - currentTileStart);

            return offset;
        },

        spin: function() {
            // get the current wheel item (tile)
            var currentTile = Wheel.calculateCurrentTile();

            // get the offset to center the wheel
            var offset = Wheel.wheelOffset();

            var randomOffset = Math.random() * (Wheel.options.width / 2);

            var possibleOffsets = [-randomOffset, randomOffset];

            var randomIndex = Math.round(Math.random());

            // calculate the scroll to the 28th item
            var scroll = (Wheel.options.width * 26 - (Wheel.options.width * (currentTile - 0.5)) + (Wheel.options.width / 2)) + possibleOffsets[randomIndex];

            // add the inner wheel for holding the items
            var inner = document.createElement('div');
            inner.setAttribute('id', Wheel.options.id + '-inner');
            inner.style.width = (Wheel.options.items * Wheel.options.width) + "px";
            inner.style.left = -offset;
            Wheel.container.appendChild(inner);

            // add the needle for the wheel
            var needle = document.createElement('div');
            needle.setAttribute('id', Wheel.options.id + '-needle');
            Wheel.container.appendChild(needle);

            // add all of the items
            for(var i = 1; i <= Wheel.options.items; i++) {
                var tile = document.createElement('div');
                tile.className = Wheel.options.className;
                inner.appendChild(tile);
            }

            // spin the wheel
            setTimeout(function() {
                Velocity(document.getElementById(Wheel.options.id + '-inner'), {
                    translateX: "-" + scroll + "px",
                }, {
                    duration: Wheel.options.duration,
                    easing: [.6, .4, .3, 1],
                });
            }, 1000);
        },

        init: function(id, options) {
            // add the container
            Wheel.container = document.getElementById(id);

            // initialize all additional options
            Wheel.options = {};
            Wheel.options.id = id;
            Wheel.options.className = options.className || Wheel.options.id + '-item';
            Wheel.options.duration = options.duration || 5000;
            Wheel.options.width = options.width;
            Wheel.options.items =  options.items || 28 + Math.ceil(Wheel.tilesPerFrame() / 2);
        }
    };
})();