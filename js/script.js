/**
 * @preserve script.js
 * Copyright (c) 2011 timmy willison
 * Dual licensed under the MIT and GPL licenses.
 * http://timmywillison.com/licence/
 */

(function( $, window, document, undefined ) {
	
	// Doc ready
	$(function() { site.ready(); });
	
	// On load instead of ready for canvas's sake
	$(window).load(function() { site.load(); });
	
	var site = {
		ready: function() {
			this.scrollers();
			this.titleClicks();

			// Add syntax highlighter
			dp.SyntaxHighlighter.ClipboardSwf = '/flash/clipboard.swf';
			dp.SyntaxHighlighter.HighlightAll('code');

			// Removes extra spacing and a line added by haml interpreter
			var $last = $('.dp-highlighter').find('li').children('span').each(function() {
				this.innerHTML = this.innerHTML.replace('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;', '');
			}).end().last();

			if ( $.trim( $last.text() ) === '' ) {
				$last.remove();
			}
			this.nav();
		},
		
		load: function() {
			var self = this;

			// Delay canvas rendering until after nav animation
			if ( $('#html5-logo').length ) {
				setTimeout(function() {

					if ( Modernizr.canvas ) {
						self.canvas();
					}

					// Click to show the canvas
					var $home = $('#home').css({ "position": "relative", "visibility": "visible", "display": "none" }),
						$html5 = $('#html5').click(function() {
							$home.stop(true, true).slideToggle();
							return false;
						}).attr('title', 'easter egg');

					if ( window.startCanvasOpen ) {
						$html5.click();
					}
				}, 3000);
			}
		},
		
		// Bring in the nav
		nav: function() {
			var $nav = $('#nav');
			if ( Modernizr.csstransitions ) {
				(function go( a ) {
					if ( (a = a.eq(0).addClass("go").end().slice(1)).length ) {
						setTimeout(function() { go( a ); }, 150);
					}	
				})( $nav.find('a') );
			} else {
				$nav.removeClass('start');
			}
		},
		
		// Back to top links
		scrollers: function() {
			
			// Retrieves a top if the anchor is pointed to an element
			function getScrollTop ( el ) {
				if ( el === '#' ) {
					return 0;
				}
				return $(el).offset().top;
			}
			
			// Scrolls to a certain pos on the page
			function scrollToTop ( href ) {
				var top = getScrollTop( href );
				return $('body, html').animate({ 'scrollTop': top }, 500, function(){ if ( href !== "#" ) { window.location.hash = href; } });
			}

			$('a.scrolling').click(function() {
				scrollToTop( $(this).attr('href') );
				return false;
			});

			// Hide me so I'm not distracting the reader
			var $me = $('#me'),
				$win = $(window).scroll( $.throttle( 100, function() {
					if ( $win.scrollTop() > 400 ) {
						$me.fadeOut( 100 );
					} else {
						$me.fadeIn( 100 );
					}
				}));
		},
		
		// Blog title clicks and disqus loading
		titleClicks: function() {
			disqus_shortname = 'timmywillison';
			var $titles = $('#blog article > header'),
				isDetail = $titles.length === 1,
				href, title;
			
			$titles.each(function() {
				var $this = $(this),
					$article = $this.parent('article');
				title = $.trim( $this.children('h1').text() ).replace(/\s/gi, '-');
				href = '/' + $.trim( $this.children('.date').text() ).slice(-4) + '/' + title + '.html';
				$this.wrap('<a class="title-link" href="'+ href +'"></a>');
				if ( !isDetail ) {
					$('<a/>', { "href": href + "#disqus_thread", "class": "comment", "data-disqus-identifier": title }).text('Comment').appendTo( $article );
				}
				$article.append('<div id="disqus_thread"></div>');
			});
			
			// Blog Detail pages
			if ( isDetail ) {
				disqus_url = "http://timmywillison.com" + href;
				disqus_identifier = title;
				$.getScript('http://' + disqus_shortname + '.disqus.com/embed.js');
			// Index
			} else {
				$.getScript('http://' + disqus_shortname + '.disqus.com/count.js');
			}
			
			// Scroll to comments if we're linking to it
			if ( window.location.hash.replace('#', '').toLowerCase() === "disqus_thread" ) {
				$('html, body').scrollTop( $('#disqus_thread').offset().top );
			}
		},
		
		// Canvas animation
		canvas: function() {
			var counter = -1,
				canvas = createCanvas(),
				imgCanvas = createCanvas(),
				ctx = canvas.getContext('2d'),
				imgCtx = imgCanvas.getContext('2d'),
				$logo = $('#html5-logo'),
				logo = $logo[0],
				$canvas = $( canvas ),
				$imgCanvas = $( imgCanvas ),
				x = ($canvas.width() / 2) - ($logo.width() / 2),
				y = ($canvas.height() / 2) - ($logo.height() / 2);
			
			draw();
			show();
			
			/**
			 * Draws the canvas
			 */
			function draw() {
				
				// Sticks the logo inside the image canvas for shadowing
				imgCtx.shadowOffsetX = 20;
				imgCtx.shadowOffsetY = 20;
				imgCtx.shadowBlur = 10;
				imgCtx.shadowColor = "rgba(0, 0, 0, 0.5)";
				imgCtx.drawImage( logo, x, y );
				
				// Add spheres
				ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
				ctx.save();
				ctx.globalCompositeOperation = "destination-over";
				for ( var i=0; i < 30; i++ ) {
					addSphere( randGrad( rand(960), rand(600) ) );
				}
				ctx.restore();
			}
			
			/**
			 * Show the canvas after we're finished drawing
			 * Removes the no-canvas images as well
			 */
			function show() {
				$logo.remove();
				$canvas.add( imgCanvas );
				$imgCanvas.mousemove( $.throttle( 100, action ) );
			}
			
			/**
			 * The fun part.  This gets bound to the canvas mousemove.
			 */
			function action( e ) {
				ctx.save();
				var gradX = e.layerX || e.offsetX,
					gradY = e.layerY || e.offsetY;
				
				loops( gradX, gradY, rand( 30 ) );
				ctx.restore();
			}
			/**
			 * Draw the loops of spheres
			 */
			function loops( translateX, translateY, numLoops ) {
				ctx.save();
				ctx.shadowColor = "rgba(0, 0, 0, 0.1)";
				for ( var i = 1; i < numLoops; i++ ) { // Loop through rings (from inside to out)
					(function( i ) {
						setTimeout(function() {
							ctx.save();
							ctx.translate( translateX, translateY );
							ctx.fillStyle = 'rgba(255, 0, 17, 0.1)';
							for ( var j=0; j < i * 6; j++ ) { // draw individual dots
								ctx.rotate( Math.PI * 2 / ( i * 6 ) );
								ctx.beginPath();
								ctx.arc( 0, i * 12.5, 5, 0, Math.PI * 2, true );
								ctx.fill();
							}
							ctx.restore();
							if ( i === 1 ) {
								addSphere( randGrad( translateX, translateY ) );
							}
						}, 50 * i);
					})( i );
				}
				ctx.restore();
			}
			/**
			 * Adds the radials to the canvas
			 */
			function addSphere( radgrad ) {
				ctx.save();
				ctx.fillStyle = radgrad;
				ctx.fillRect( 0, 0, 960, 600 );
				ctx.restore();
			}
			/**
			 * @return Random number
			 */
			function rand( max ) {
				max = max || 255;
				return Math.round( max * Math.random() );
			}
			/**
			 * @return Random Radial Gradient
			 */
			function randGrad( x, y ) {
				var radgrad = ctx.createRadialGradient( x, y, 0, x+5, y+5, rand( 400 ) );
				radgrad.addColorStop(0, 'rgba(255, 0, 17, 0.5)');
				radgrad.addColorStop(0.75, 'rgba(69, 125, 245, 0.5)');
				radgrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
				return radgrad;
			}
			// Attaches the canvas to the document
			function createCanvas() {
				counter++;
				return $('<canvas height="600" id="canvas'+ (counter === 0 ? '' : counter) +'" width="960" title="Super HTML5!"></canvas>').insertBefore('#html5-logo')[0];
			}
		}
	};
	
})( jQuery, this, this.document );