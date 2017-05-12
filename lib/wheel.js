(function() {
    window.Wheel = {

        // Find the current tile number where needle is present
        calculateCurrentTile: function(wheel) {
            var wheelElement = wheel.container;
            var width = wheelElement.clientWidth;
            var needlePosition = width / 2;

            var currentTile = needlePosition / Wheel.options.width;

            return Math.ceil(currentTile);
        },

        // Calculate the amount of viewable tiles within a frame
        tilesPerFrame: function(offset, wheel) {
            var wheelElement = wheel.container;
            var width = wheelElement.clientWidth;

            width -= parseInt(offset);

            return Math.ceil(width / Wheel.options.width);
        },

        // Calculate the offset to center the wheel upon beginning
        wheelOffset: function(wheel) {
            var wheelElement = wheel.container;
            var needle = wheelElement.clientWidth / 2;

            var currentTile = Wheel.calculateCurrentTile(wheel);
            var currentTileStart = currentTile * Wheel.options.width;

            var offset = (Wheel.options.width / 2) - (needle - currentTileStart);

            return offset;
        },

        // Create the wheel tracks, beginning tiles and the center needle
        createWheels: function(offset, nextTrackScroll, wheel, winner) {
            if(!wheel.started) {
                var wheelElement = wheel.container;

                winner = winner || false;

                var inner = document.createElement('div');
                inner.setAttribute('id', Wheel.options.prefix + wheel.id + '-inner');
                inner.style.width = (Wheel.options.items * Wheel.options.width) + "px";
                inner.style.left = -offset;
                inner.className = Wheel.options.prefix + '-inner';
                wheelElement.appendChild(inner);

                var inner2 = document.createElement('div');
                inner2.setAttribute('id', Wheel.options.prefix + wheel.id + '-inner2');
                inner2.style.width = (Wheel.options.items * Wheel.options.width) + "px";
                inner2.style.left = nextTrackScroll;
                inner2.style.display = 'none';
                inner2.className = Wheel.options.prefix + '-inner';
                wheelElement.appendChild(inner2);

                var needle = document.createElement('div');
                needle.setAttribute('id', Wheel.options.prefix + wheel.id + '-needle');
                needle.className = Wheel.options.prefix + '-needle';
                wheelElement.appendChild(needle);
                
                for(var i = 1; i <= Wheel.options.items; i++) {
                    var tile = document.createElement('div');
                    tile.className = Wheel.options.prefix + '-item';
                    tile.innerHTML = Wheel.items[Math.floor(Math.random() * Wheel.items.length)];
                    if(i == 28) {
                        if(winner) {
                            tile.innerHTML = winner;
                        }
                    }
                    inner.appendChild(tile);
                }
            }
        },

        // Update the offset and visibility of wheel tracks
        updateWheels: function(nextTrackString, nextTrackScroll, wheel) {
            var currentTrack = document.getElementById(Wheel.options.prefix + wheel.id + '-' + wheel.currentTrack);
            currentTrack.style.display = 'block';

            var nextTrack = document.getElementById(Wheel.options.prefix + wheel.id + '-' + nextTrackString);
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
        getPossibleOffsets: function(offset, wheel) {
            offset = Math.abs(parseFloat(offset));

            var currentTile = Wheel.calculateCurrentTile(wheel);
            var currentTileWidth = currentTile * Wheel.options.width;

            var left = offset - (currentTileWidth - (wheel.container.clientWidth / 2));
            var right = Wheel.options.width - left;

            left -= 5;
            right -= 5;

            var randomLeft = -Math.random() * left;
            var randomRight = Math.random() * right;

            if(randomLeft >= -5) {
                return [randomRight, randomRight];
            }

            if(randomRight <= 5) {
                return [randomLeft, randomLeft];
            }

            return [randomLeft, randomRight];
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
        spin: function(wheel, winner) {
            wheel = wheel - 1 || 0;
            winner = winner || false;

            if(!Wheel.wheels[wheel]) {
                Wheel.add(wheel);
            }

            if(!Wheel.wheels[wheel].prepared) {
                Wheel.prepare(wheel + 1);
            }

            var currentWheel = Wheel.wheels[wheel];

            if(winner) {
                currentWheel.track.children[27].innerHTML = winner;
                currentWheel.nextTrack.children[Wheel.calculateCurrentTile(currentWheel)].innerHTML = winner;
            }

            // Wheel is now starting
            currentWheel.started = true;

            // Use velocity to create the animation
            Velocity(currentWheel.track, {

                // Move wheel left the specific pixels
                translateX: "-" + currentWheel.scroll + "px",
            }, {
                
                // Move for the duration specfied by user
                duration: Wheel.options.duration,

                // Ease into the transformation (editable in the future)
                easing: [.6, .4, .3, 1],

                // Upon completion of spin, do the following
                complete: function() {

                    // Set the current track to the next track
                    currentWheel.currentTrack = currentWheel.nextTrackString;

                    // Reset the velocity transformation back to 0
                    Velocity.hook(currentWheel.nextTrack, 'translateX', '0px');

                    // Hide the previously spun track
                    currentWheel.track.style.display = 'none';

                    // Show the new track
                    currentWheel.nextTrack.style.display = 'block';

                    currentWheel.prepared = false;
                }
            });
        },

        prepare: function(wheel, winner) {
            wheel = wheel - 1 || 0;
            winner = winner || false;

            if(!Wheel.wheels[wheel]) {
                Wheel.add(wheel);
            }

            var currentWheel = Wheel.wheels[wheel];

            // Get the current wheel item (tile)
            var currentTile = Wheel.calculateCurrentTile(currentWheel);

            // Get the offset to center the wheel
            var offset = Wheel.wheelOffset(currentWheel);

            // Get all possible offsets for the next spin
            var possibleOffsets = Wheel.getPossibleOffsets(offset, currentWheel);

            // Get a random integer between 0 - 1 to select which offset to use
            var randomIndex = Math.round(Math.random());

            // Create the wheel tracks, etc
            Wheel.createWheels(offset, Wheel.getNextScroll(offset, possibleOffsets[randomIndex]), currentWheel, winner);   

            // Get the first track
            var track = document.getElementById(Wheel.options.prefix + currentWheel.id + '-' + currentWheel.currentTrack);                  

            // Get the offset of the first track
            offset = track.style.left;

            // Get the amount of tiles in a frame
            var tiles = Wheel.tilesPerFrame(offset, currentWheel);

            // Get the possible offsets using the new offset from current track
            possibleOffsets = Wheel.getPossibleOffsets(offset, currentWheel);

            // Calculate the initial scroll to the 28th tile
            var initialScroll = Wheel.options.width * (27 - currentTile);

            // Integrate the possible offset into the scroll
            var scroll = initialScroll + possibleOffsets[randomIndex];

            // Set the next track name
            if(Wheel.wheels[wheel].currentTrack == 'inner') {
                nextTrackString = 'inner2';
            }

            if(Wheel.wheels[wheel].currentTrack == 'inner2') {
                nextTrackString = 'inner';
            }

            // Get the next track using the previously set name
            var nextTrack = document.getElementById(Wheel.options.prefix + currentWheel.id + '-' + nextTrackString);

            // Update the next track's offset
            Wheel.updateWheels(nextTrackString, Wheel.getNextScroll(offset, possibleOffsets[randomIndex]), currentWheel);

            // Add the tiles to the next track
            for(var i = 0; i <= Wheel.options.items; i++) {

                // Make the first few tiles equal to the last few tiles from previous wheel
                if(i < tiles) {
                    var tile = track.children[(Wheel.options.items) - Math.ceil(tiles) + i].cloneNode(true);
                } else {
                    var tile = document.createElement('div');
                    tile.innerHTML = Wheel.items[Math.floor(Math.random() * Wheel.items.length)];
                    if(i == 27) {
                        if(winner) {
                            tile.innerHTML = winner;
                        }
                    }
                    tile.className = Wheel.options.prefix + '-item';
                }
                nextTrack.appendChild(tile);
            }

            currentWheel.nextTrackString = nextTrackString;    
            currentWheel.scroll = scroll;
            currentWheel.track = track;
            currentWheel.nextTrack = nextTrack;
            currentWheel.prepared = true;        
        },

        add: function(wheel) {
            var newWheel = document.createElement('div');
            newWheel.setAttribute('id', Wheel.options.prefix + wheel);
            newWheel.className = Wheel.options.prefix;

            Wheel.container.append(newWheel);

            Wheel.wheels[wheel] = {
                id: wheel,
                currentTrack: 'inner',
                started: false,
                prepared: false,
                nextTrackString: '',
                track: null,
                nextTrack: null,
                scroll: 0,
                container: document.getElementById(Wheel.options.prefix + wheel)
            };
        },

        remove: function(wheel) {
            wheel = wheel - 1 || 0;
            Wheel.wheels[wheel].container.remove();
            delete Wheel.wheels[wheel];
        },

        // Initialize the object
        init: function(id, options) {

            // Add the container
            Wheel.container = document.getElementById(id);

            // Add the items to be used with the wheel
            Wheel.items = options.items;

            Wheel.wheels = {};

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
            Wheel.options.items =  options.itemCount || 28 + Math.ceil(Wheel.tilesPerFrame(Wheel.wheelOffset(Wheel), Wheel) / 2);

            Wheel.options.prefix = options.prefix || 'wheel';
        }
    };
})();