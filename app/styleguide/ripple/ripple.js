/**
 * Class constructor for Ripple WSK component.
 * Implements WSK component design pattern defined at:
 * https://github.com/jasonmayes/wsk-component-design-pattern
 * @param {HTMLElement} element The element that will be upgraded.
 */
function MaterialRipple(element) {
  'use strict';

  this.element_ = element;

  // Initialize instance.
  this.init();
}

/**
 * Store constants in one place so they can be updated easily.
 * @enum {string | number}
 * @private
 */
MaterialRipple.prototype.Constant_ = {
  INITIAL_SCALE: 'scale(0.0001, 0.0001)',
  INITIAL_SIZE: '1px',
  INITIAL_OPACITY: '0.4',
  FINAL_OPACITY: '0',
  FINAL_SCALE: ''
};

/**
 * Store strings for class names defined by this component that are used in
 * JavaScript. This allows us to simply change it in one place should we
 * decide to modify at a later date.
 * @enum {string}
 * @private
 */
MaterialRipple.prototype.CssClasses_ = {
  WSK_RIPPLE_CENTER: 'wsk-ripple--center',

  WSK_JS_RIPPLE_EFFECT_IGNORE_EVENTS: 'wsk-js-ripple-effect--ignore-events',

  WSK_RIPPLE: 'wsk-ripple',

  IS_ANIMATING: 'is-animating'
};


/**
 * Handle click of element.
 * @param {Event} event The event that fired.
 * @private
 */
MaterialRipple.prototype.downHandler_ = function(event) {
  'use strict';

  if (event.type === 'mousedown' && this.ignoringMouseDown_) {
    this.ignoringMouseDown_ = false;
  } else {
    if (event.type === 'touchstart') {
      this.ignoringMouseDown_ = true;
    }
    var frameCount = this.getFrameCount();
    if (frameCount > 0) {
      return;
    }
    this.setFrameCount(1);
    var bound = event.currentTarget.getBoundingClientRect();
    var x;
    var y;
    // Check if we are handling a keyboard click.
    if (event.clientX === 0 && event.clientY === 0) {
      x = Math.round(bound.width / 2);
      y = Math.round(bound.height / 2);
    } else {
      var clientX = event.clientX ? event.clientX : event.touches[0].clientX;
      var clientY = event.clientY ? event.clientY : event.touches[0].clientY;
      x = Math.round(clientX - bound.left);
      y = Math.round(clientY - bound.top);
    }
    this.setRippleXY(x, y);
    this.setRippleStyles(true);
    window.requestAnimFrame(this.animFrameHandler.bind(this));
  }
};


/**
 * Initialize element.
 */
MaterialRipple.prototype.init = function() {
  'use strict';

  if (this.element_) {
    var recentering =
        this.element_.classList.contains(this.CssClasses_.WSK_RIPPLE_CENTER);
    if (!this.element_.classList.contains(
        this.CssClasses_.WSK_JS_RIPPLE_EFFECT_IGNORE_EVENTS)) {
      this.rippleElement_ = this.element_.querySelector('.' +
          this.CssClasses_.WSK_RIPPLE);
      this.frameCount_ = 0;
      this.rippleSize_ = 0;
      this.x_ = 0;
      this.y_ = 0;

      // Touch start produces a compat mouse down event, which would cause a
      // second ripples. To avoid that, we use this property to ignore the first
      // mouse down after a touch start.
      this.ignoringMouseDown_ = false;

      if (this.rippleElement_) {
        var bound = this.element_.getBoundingClientRect();
        this.rippleSize_ = Math.max(bound.width, bound.height) * 2;
        this.rippleElement_.style.width = this.rippleSize_ + 'px';
        this.rippleElement_.style.height = this.rippleSize_ + 'px';
      }

      this.element_.addEventListener('mousedown', this.downHandler_.bind(this));
      this.element_.addEventListener('touchstart',
          this.downHandler_.bind(this));

      this.getFrameCount = function() {
        return this.frameCount_;
      };

      this.setFrameCount = function(fC) {
        this.frameCount_ = fC;
      };

      this.getRippleElement = function() {
        return this.rippleElement_;
      };

      this.setRippleXY = function(newX, newY) {
        this.x_ = newX;
        this.y_ = newY;
      };

      this.setRippleStyles = function(start) {
        if (this.rippleElement_ !== null) {
          var transformString;
          var scale;
          var size;
          var offset = 'translate(' + this.x_ + 'px, ' + this.y_ + 'px)';

          if (start) {
            scale = this.Constant_.INITIAL_SCALE;
            size = this.Constant_.INITIAL_SIZE;
          } else {
            scale = this.Constant_.FINAL_SCALE;
            size = this.rippleSize_ + 'px';
            if (recentering) {
              offset = 'translate(' + bound.width / 2 + 'px, ' +
                bound.height / 2 + 'px)';
            }
          }

          transformString = 'translate(-50%, -50%) ' + offset + scale;

          this.rippleElement_.style.webkitTransform = transformString;
          this.rippleElement_.style.msTransform = transformString;
          this.rippleElement_.style.transform = transformString;

          if (start) {
            this.rippleElement_.style.opacity = this.Constant_.INITIAL_OPACITY;
            this.rippleElement_.classList.remove(this.CssClasses_.IS_ANIMATING);
          } else {
            this.rippleElement_.style.opacity = this.Constant_.FINAL_OPACITY;
            this.rippleElement_.classList.add(this.CssClasses_.IS_ANIMATING);
          }
        }
      };

      this.animFrameHandler = function() {
        if (this.frameCount_-- > 0) {
          window.requestAnimFrame(this.animFrameHandler.bind(this));
        } else {
          this.setRippleStyles(false);
        }
      };
    }
  }
};


// The component registers itself. It can assume componentHandler is available
// in the global scope.
if (typeof componentHandler !== 'undefined') {
  componentHandler.register({
    constructor: MaterialRipple,
    classAsString: 'MaterialRipple',
    cssClass: 'wsk-js-ripple-effect'
  });
}
