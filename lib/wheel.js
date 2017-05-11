(function() {
    window.Wheel = {
        // which track is currently being used
        currentTrack: 'inner',

        // check if wheel has started - initiation of wheels
        started: false,

        // Find the current tile number where needle is present
        calculateCurrentTile: function() {
            var width = Wheel.container.clientWidth;
            var needlePosition = width / 2;

            var currentTile = needlePosition / Wheel.options.width;

            return Math.ceil(currentTile);
        },

        // Calculate the amount of viewable tiles within a frame
        tilesPerFrame: function() {
            var width = Wheel.container.clientWidth;

            return width / Wheel.options.width;
        },

        // Calculate the offset to center the wheel upon beginning
        wheelOffset: function() {
            var needle = Wheel.container.clientWidth / 2;

            var currentTile = Wheel.calculateCurrentTile();
            var currentTileStart = currentTile * Wheel.options.width;

            var offset = (Wheel.options.width / 2) - (needle - currentTileStart);

            return offset;
        },

        // Create the wheel tracks, beginning tiles and the center needle
        createWheels: function(offset, nextTrackScroll) {
            if(!Wheel.started) {
                var inner = document.createElement('div');
                inner.setAttribute('id', Wheel.options.id + '-inner');
                inner.style.width = (Wheel.options.items * Wheel.options.width) + "px";
                inner.style.left = -offset;
                Wheel.container.appendChild(inner);

                var inner2 = document.createElement('div');
                inner2.setAttribute('id', Wheel.options.id + '-inner2');
                inner2.style.width = (Wheel.options.items * Wheel.options.width) + "px";
                inner2.style.left = nextTrackScroll;
                inner2.style.display = 'none';
                Wheel.container.appendChild(inner2);

                var needle = document.createElement('div');
                needle.setAttribute('id', Wheel.options.id + '-needle');
                Wheel.container.appendChild(needle);
                
                for(var i = 1; i <= Wheel.options.items; i++) {
                    var tile = document.createElement('div');
                    tile.className = Wheel.options.className;
                    tile.innerHTML = Wheel.items[Math.floor(Math.random() * Wheel.items.length)];
                    inner.appendChild(tile);
                }
            }
        },

        // Update the offset and visibility of wheel tracks
        updateWheels: function(nextTrackString, nextTrackScroll) {
            var currentTrack = document.getElementById(Wheel.options.id + '-' + Wheel.currentTrack);
            currentTrack.style.display = 'block';

            var nextTrack = document.getElementById(Wheel.options.id + '-' + nextTrackString);
            nextTrack.innerHTML = '';
            nextTrack.style.left = nextTrackScroll;
            nextTrack.style.transform = 'translateX(0)';
            nextTrack.style.display = 'none';
        },

        /**
         * Retrieve all possible randomized offsets
         * 
         * This is used to make the wheel spin more dramatic instead of stopping in the center of tile each time
         */
        getPossibleOffsets: function(offset) {
            offset = Math.abs(parseFloat(offset));

            var currentTile = Wheel.calculateCurrentTile();
            var currentTileWidth = currentTile * Wheel.options.width;

            var left = offset - (currentTileWidth - (Wheel.container.clientWidth / 2));
            var right = Wheel.options.width - left;

            return [-Math.random() * left, Math.random() * right];
        },

        // Calculate how far the next track should be offset
        getNextScroll: function(offset, possibleOffset) {
            var nextTrackScroll;

            offset = parseFloat(offset);

            if(possibleOffset <= 0) {
                nextTrackScroll = offset - possibleOffset;
            } else {
                nextTrackScroll = offset - possibleOffset;
            }

            return nextTrackScroll;
        },

        // Spin the wheel
        spin: function() {

            // Get the current wheel item (tile)
            var currentTile = Wheel.calculateCurrentTile();

            // Get the amount of tiles in a frame
            var tiles = Wheel.tilesPerFrame();

            // Get the offset to center the wheel
            var offset = Wheel.wheelOffset();

            // Get all possible offsets for the next spin
            var possibleOffsets = Wheel.getPossibleOffsets(offset);

            // Get a random integer between 0 - 1 to select which offset to use
            var randomIndex = Math.round(Math.random());

            // Create the wheel tracks, etc
            Wheel.createWheels(offset, Wheel.getNextScroll(offset, possibleOffsets[randomIndex]));   

            // Get the first track
            var track = document.getElementById(Wheel.options.id + '-' + Wheel.currentTrack);                  

            // Get the offset of the first track
            offset = track.style.left;

            // Get the possible offsets using the new offset from current track
            possibleOffsets = Wheel.getPossibleOffsets(offset);

            // Calculate the initial scroll to the 28th tile
            var initialScroll = Wheel.options.width * (27 - currentTile);

            // Integrate the possible offset into the scroll
            var scroll = initialScroll + possibleOffsets[randomIndex];

            // Set the next track name
            if(Wheel.currentTrack == 'inner') {
                nextTrackString = 'inner2';
            }

            if(Wheel.currentTrack == 'inner2') {
                nextTrackString = 'inner';
            }

            // Get the next track using the previously set name
            var nextTrack = document.getElementById(Wheel.options.id + '-' + nextTrackString);

            // Update the next track's offset
            Wheel.updateWheels(nextTrackString, Wheel.getNextScroll(offset, possibleOffsets[randomIndex]));

            // Add the tiles to the next track
            for(var i = 0; i <= Wheel.options.items - 1; i++) {

                // Make the first few tiles equal to the last few tiles from previous wheel
                if(i <= tiles + 1) {
                    console.log((Wheel.options.items - 1) - Math.ceil(tiles) + i);
                    var tile = track.children[(Wheel.options.items - 1) - Math.ceil(tiles) + i].cloneNode(true);
                } else {
                    var tile = document.createElement('div');
                    tile.innerHTML = Wheel.items[Math.floor(Math.random() * Wheel.items.length)];
                    tile.className = Wheel.options.className;
                }
                nextTrack.appendChild(tile);
            }

            // Wheel is now starting
            Wheel.started = true;

            // Use velocity to create the animation
            Velocity(track, {

                // Move wheel left the specific pixels
                translateX: "-" + scroll + "px",
            }, {
                
                // Move for the duration specfied by user
                duration: Wheel.options.duration,

                // Ease into the transformation (editable in the future)
                easing: [.6, .4, .3, 1],

                // Upon completion of spin, do the following
                complete: function() {

                    // Set the current track to the next track
                    Wheel.currentTrack = nextTrackString;

                    // Reset the velocity transformation back to 0
                    Velocity.hook(nextTrack, 'translateX', '0px');

                    // Hide the previously spun track
                    track.style.display = 'none';

                    // Show the new track
                    nextTrack.style.display = 'block';
                }
            });
        },

        // Initialize the object
        init: function(id, options) {

            // Add the container
            Wheel.container = document.getElementById(id);

            // Add the items to be used with the wheel
            Wheel.items = options.items;

            // Initialize all additional options
            Wheel.options = {};

            /**
             * ID of the wheel
             * 
             * Also used for the children of the wheel, useful for styling
             * i.e. 'wheel' is ID
             * 
             * wheel-inner, wheel-inner2, wheel-needle, etc
             */
            Wheel.options.id = id;

            // Set the class name of each item, default is {id}-item
            Wheel.options.className = options.className || Wheel.options.id + '-item';

            // Set the duration of the spin, default is 5 seconds
            Wheel.options.duration = options.duration || 5000;

            // Set the width of each tile/item
            Wheel.options.width = options.width;

            // The amount of tiles to be used in the wheel, name will be changed soon
            Wheel.options.items =  options.itemCount || 28 + Math.ceil(Wheel.tilesPerFrame() / 2);
        }
    };
})();