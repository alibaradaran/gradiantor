'use strict';
/**
 * Vanilla JS Advanced Gradient Builder
 * Part Of Genereight App Generator Frontend Collection
 * @version: 1
 * @author: ali.baradaran@gmail.com
 */
class Gn8Gradiantor {
    constructor ( data ) {
        this.toolbox;
        this.promise;
        this.isRepeating = false;
        this.isLinear = true;
        this.isRadial = false;
        this.colors = [];
        this.angle = 90;
        this.shape = "ellipse";
        this.center = {
            "x" : 50,
            "y" : 50
        };
        this.size = "farthest-corner"; /** farthest-corner, contain : closest-side */
        //radial-gradient(circle closest-side at 60% 55%, red, yellow, black)
        //repeating-radial-gradient(circle closest-side at 60% 55%, red, yellow, black)
        //linear-gradient(angle, color-stop1, color-stop2)
        //repeating-linear-gradient(angle, color-stop1, color-stop2)
        this.promiseResolve;
        this.promiseReject;
        this.timer;
        this.lastPosition = {
            "x" : 0,
            "y" : 0
        };
        this.string = "";
        this.rotateRect = {};
        this.rotateEnvironment = 0;
        if ( typeof data != "object" ) {
            try {
                this.data = JSON.parse( data );
            } catch (error) {
                console.log( "not valid data - gn8Colorize" );
            }
        } else {
            this.data = data;
        }
        try {
            this.id = this.data.id + "-gradiantor" || this.idFunction() + "-gradiantor";
            this.container = this.data.container;
            this.value = this.data.value || "linear-gradient(30deg, rgb(55, 192, 176) 0%, rgb(245, 155, 146) 100%)";
            if ( this.value == "none" ) this.value = "linear-gradient(90deg, rgb(55, 192, 176) 0%, rgb(245, 155, 146) 100%)";
            if ( this.value ) {
                this.analyseValue();
                this.string = this.value;
            }
        } catch (error) {
            console.log( "can not create - Gn8Gradiantor" );
        }
       
    }
    init () {
        var checked = "";
        if ( this.isRepeating ) checked = "checked";
        this.toolbox = document.createElement( "div" );
        this.toolbox.id = this.id;
        this.toolbox.classList.add( "gn8-gradiantor-toolbox" );
        this.toolbox.innerHTML = `
            <div class="gn8-gradiantor-wrap" ></div>
            <div class="gn8-gradiantor-tool-wrap" >
                <ul class="gn8-gradiantor-tool-list" >
                    <li data-tooltype="linear" class="gn8-gradiantor-tool linear" style="background-image: linear-gradient(90deg, black, white); background-clip: content-box;" >
                    </li>
                    <li data-tooltype="radial" class="gn8-gradiantor-tool radial" style="background-image: radial-gradient(black, white); background-clip: content-box;" >
                    </li>
                    <li style="display: flex; flex-direction: row; align-items: center; margin-left: 10px;" > 
                        <input type="checkbox" id="${this.id}-is-repeating" ${checked} > 
                        <label for="${this.id}-is-repeating" style="font-size:.8em;">Repeating Gradient</label> 
                    </li>
                </ul>
                <div class="gn8-gradiantor-tool-container" ></div>
            </div>            
        `;
        this.container.appendChild( this.toolbox );
        this.toolContainer = this.toolbox.querySelector( ".gn8-gradiantor-tool-container" );
        this.toolContainer.addEventListener( "click", function (e) {
            if ( e.target == e.currentTarget ) {
                if ( document.getElementById( this.id + "-lab" ) && e.target === e.currentTarget ) {
                    document.getElementById( this.id + "-lab" ).remove();
                }
                this.toolbox.querySelectorAll( ".gn8-gradiantor-picker-cursor" ).forEach( element => {
                    element.classList.remove( "active" );
                } );
            }
        }.bind( this ) );
        this.toolbox.addEventListener( "click", function (e) {
            e.stopPropagation();
        } );
        this.toolbox.querySelector( ".gn8-gradiantor-wrap" ).addEventListener( "click", function (e) {
            this.toolbox.remove();
            this.promiseResolve( this.string );
        }.bind( this ) );
        this.promise = new Promise( ( resolve, reject ) => {
            this.promiseResolve = resolve;
            this.promiseReject = reject;
            var tools = this.toolbox.querySelectorAll( "li.gn8-gradiantor-tool" );
            for ( let index = 0; index < tools.length; index++ ) {
                tools[index].addEventListener( "click", function (e) {
                    if ( document.getElementById( this.id + "-lab" ) && e.target === e.currentTarget ) document.getElementById( this.id + "-lab" ).remove();
                    this.toolbox.querySelectorAll( ".gn8-gradiantor-picker-cursor" ).forEach( element => {
                        element.classList.remove( "active" );
                    } );
                }.bind( this ) );
                tools[index].addEventListener( "click", function (e) {  
                    for ( let index = 0; index < tools.length; index++ ) {
                        tools[index].classList.remove( "active" );
                    }
                    e.currentTarget.classList.add( "active" );
                    this[ e.currentTarget.getAttribute( "data-tooltype" ) ]();
                }.bind( this ) );
            }
            document.getElementById( `${this.id}-is-repeating` ).addEventListener( "change", function (e) {
                this.isRepeating = e.currentTarget.checked;
                if ( this.isLinear )  this.linear();
                if ( this.isRadial )  this.radial();
            }.bind( this ) );
            if ( this.isLinear ) {
                this.toolbox.querySelector( "li.gn8-gradiantor-tool.linear" ).classList.add( "active" ); 
                this.linear();
            }else{
                this.toolbox.querySelector( "li.gn8-gradiantor-tool.radial" ).classList.add( "active" ); 
                this.radial();
            }
        } );
        return this.promise;
    }
    analyseValue () {
        var type = "";
        var desc = "";
        var colors = [];
        var types = ["linear-gradient","radial-gradient","repeating-linear-gradient","repeating-radial-gradient"];
        types.forEach( t => {
            if ( this.value.search( t ) > -1 ) type = t;
        } );
        if ( !type ) return;
        this.value = this.value.replace( type, '' );
        var reg = /rgba?(\(\s*\d+\s*,\s*\d+\s*,\s*\d+)(?:\s*,.+?)?\)/g;
        do {
            var color = reg.exec( this.value );
            if ( color ) {
                colors.push( color[0] );
            }
        } while ( color );
        if ( colors && colors.length > 0 ) {
            for (let index = 0; index < colors.length; index++) {
                this.value = this.value.replace( colors[index], `cooloor-${index}` );
            }
            this.value = this.value.replace( "(", '' ).replace( ")", '' );
            var parts = this.value.split( "," );
            if ( parts[0].search( "cooloor-" ) < 0 ) desc = parts[0];
            for (let index = 0; index < parts.length; index++) {
                var part = parts[ index ];
                for (let index = 0; index < colors.length; index++) {
                    const color = colors[index];
                    if ( part.search( "cooloor-"+index ) > -1 ) {
                        var pers = part.replace( "cooloor-"+index, '' ).replace(/ /g,'');
                        var clrid = this.idFunction();
                        var theColor = [ color, "", clrid ];
                        if ( !isNaN( parseInt( pers ) ) ) theColor[1] = parseInt( pers );
                        this.colors.push( theColor );
                        continue;
                    }
                }
            }
            switch ( type ) {
                case 'linear-gradient':
                    this.isLinear = true;
                    this.isRadial = false;
                    this.isRepeating = false;
                    if ( desc ) this.angle = parseInt( desc ) || 90;
                    break;
                case 'repeating-linear-gradient':
                    this.isLinear = true;
                    this.isRadial = false;
                    this.isRepeating = true;
                    if ( desc ) this.angle = parseInt( desc ) || 90;
                break;        
                case 'radial-gradient':
                    this.isLinear = false;
                    this.isRadial = true;
                    this.isRepeating = false;
                break;                
                case 'repeating-radial-gradient':
                    this.isLinear = false;
                    this.isRadial = true;
                    this.isRepeating = true;
                break;
                default:
                break;
            }
            if ( ["radial-gradient","repeating-radial-gradient"].indexOf( type ) > -1 ) {
                if ( desc.search( "circle" ) > -1 ) {
                    this.shape = "circle";
                    desc = desc.replace( "circle", "" );
                }
                if ( desc.search( "closest-side" ) > -1 ) {
                    this.size = "closest-side";
                    desc = desc.replace( "closest-side", "" );
                }else{
                    desc = desc.replace( "farthest-corner", "" );
                }
                ["farthest-corner","farthest-side","closest-corner","closest-side"].forEach( element => {
                    desc = desc.replace( element, "" );
                } );
                desc = desc.replace( "at", "" ).trim();
                var center = desc.split( " " );
                if ( center[0] && parseInt( center[0] ) > -1 ) this.center.x = parseInt( center[0] );
                if ( center[1] && parseInt( center[1] ) > -1 ) this.center.y = parseInt( center[1] );
            }
        }
    }
    linear () {
        var fitGradient = function ( deg ) {
            var x = 1.6;
            var divDeg = ( deg % 90 ) * (Math.PI / 180)
            var width = this.toolContainer.offsetWidth;
            var height = this.toolContainer.offsetHeight;
            var minLength = width / x;
            var theWidth =  Math.ceil( minLength * Math.cos( Math.abs( divDeg ) ) + minLength * Math.sin(  Math.abs( divDeg ) ) );
            var gradient = this.toolContainer.querySelector( ".gn8-gradiantor-gradient-container" );
            gradient.style.width = "12px";
            gradient.style.height = theWidth + "px";
            gradient.style.left = ( width - 6 ) / 2 + "px";
            gradient.style.top = ( height - theWidth ) / 2 + "px";
            gradient.style.webkitTransform = 'rotate('+deg+'deg)';
            gradient.style.mozTransform    = 'rotate('+deg+'deg)';
            gradient.style.msTransform     = 'rotate('+deg+'deg)';
            gradient.style.oTransform      = 'rotate('+deg+'deg)'; 
            gradient.style.transform = 'rotate('+deg+'deg)';
            
            var rotate = this.toolContainer.querySelector( ".gn8-gradiantor-rotate" );
            rotate.style.webkitTransform = 'rotate('+deg+'deg)';
            rotate.style.mozTransform    = 'rotate('+deg+'deg)';
            rotate.style.msTransform     = 'rotate('+deg+'deg)';
            rotate.style.oTransform      = 'rotate('+deg+'deg)'; 
            rotate.style.transform = 'rotate('+deg+'deg)';
        }.bind( this );

        var drawGradient = function ( colors ) {
            colors = sortColors( colors );
            var frame = this.toolContainer.querySelector( ".gn8-gradiantor-frame" );
            var gradient = this.toolContainer.querySelector( ".gn8-gradiantor-gradient-container" );
            var stepsContainer = gradient.querySelector( ".gn8-gradiantor-gradient-steps" );
            stepsContainer.innerHTML = `<canvas id="${this.id}-gradient-canvas" width="10" height="${stepsContainer.offsetHeight}"></canvas>`;
            var canvas = document.getElementById( `${this.id}-gradient-canvas` );
            var ctx = canvas.getContext("2d");
            var grd = ctx.createLinearGradient(0, stepsContainer.offsetHeight, 0, 0);

            // Fill with gradient
            var colorsArray = [];
            for (let index = 0; index < colors.length; index++) {
                const color = colors[index];
                colorsArray.push( `${color[0]} ${color[1]}%` );
                grd.addColorStop( color[1] / 100, color[0] );
                addColor( index, color[0], color[1], color[2] );
            }
            ctx.fillStyle = grd;
            ctx.fillRect(0, 0, 10, stepsContainer.offsetHeight);
            
            if ( this.isRepeating ) {
                var realBackgroundImage = `repeating-linear-gradient(${this.angle}deg,${colorsArray.join(",")})`;
            }else{
                var realBackgroundImage = `linear-gradient(${this.angle}deg,${colorsArray.join(",")})`;
            }
            frame.style.backgroundImage = realBackgroundImage;
            canvas.addEventListener( "click", function (e) {
                var c = e.currentTarget || e.target;
                var ctx = c.getContext("2d"); 
                var imgData = ctx.getImageData( e.offsetX, e.offsetY, 1, 1 );
                var color = `rgba(${imgData.data[0]},${imgData.data[1]},${imgData.data[2]},${imgData.data[3]})`;
                var percent = ( ( c.height - e.offsetY ) / c.height ) * 100;
                var id = this.idFunction();
                this.colors.push( [ color, percent, id ] );
                drawGradient( this.colors );
            }.bind( this ) );
            collectString();
        }.bind( this );

        var collectString = function () {
            var colors = [];
            this.colors.forEach( color => {
                var percent = "";
                if ( color[1] || color[1] === 0 ) percent = color[1] + "%";
                colors.push( `${color[0]} ${percent}` );
            } );
            colors = colors.join();
            if ( !this.isRepeating ) {
                this.string = `linear-gradient(${this.angle}deg,${colors})`;
            }else{
                this.string = `repeating-linear-gradient(${this.angle}deg,${colors})`;
            }
            console.log(this.string);
        }.bind( this );

        var addColor = function ( index, color, percent, id ) {
            var steps = this.toolContainer.querySelector( ".gn8-gradiantor-gradient-steps" );
            var maxHeight = steps.offsetHeight;
            var mark = document.createElement( "div" );
            mark.classList.add( "gn8-gradiantor-picker-cursor" );
            mark.innerHTML = `<span style="display: inline; background-color: ${color};" ></span>`;
            mark.setAttribute( "data-color-index", index );
            mark.setAttribute( "data-color-percn", percent );
            mark.setAttribute( "data-color-id", id );
            steps.appendChild( mark );
            var bottom = percent - ( ( mark.offsetHeight / 2 ) / maxHeight ) * 100;
            if ( ( ( percent / 100 ) * maxHeight + mark.offsetHeight ) > maxHeight ) {
                bottom = ( ( maxHeight - mark.offsetHeight ) / maxHeight ) * 100;
            }
            if ( ( ( percent / 100 ) * maxHeight - mark.offsetHeight ) < 0 ) {
                bottom = 0;
            }
            mark.style.bottom = bottom + "%";
            mark.addEventListener( "click", function ( e ) {
                manageColor( e );
            } );
        }.bind( this );

        var manageColor = function (e) {
            var markr = e.currentTarget;
            var color = window.getComputedStyle( markr.querySelector( "span" ), null ).getPropertyValue("background-color");
            var percn = parseInt( markr.getAttribute( "data-color-percn" ) );
            var clrid = markr.getAttribute( "data-color-id" );
            var index = markr.getAttribute( "data-color-index" );
            var dlt = `<div id="${this.id}-delete" style="margin: 5%; font-size: 2em; color: red; cursor: pointer;">&times;</div>`;
            if ( parseInt( index ) == 0 || index == this.colors.length - 1 ) {
                dlt = `<div id="${this.id}-delete" style="margin: 5%; font-size: 2em; color: rgba(0,0,0,.2); cursor: not-allowed;">&times;</div>`;
            }
            this.toolbox.querySelectorAll( ".gn8-gradiantor-picker-cursor" ).forEach( element => {
                element.classList.remove( "active" );
            } );
            markr.classList.add( "active" );
            if ( !document.getElementById( this.id + "-lab" ) ) {
                var lab = document.createElement( "div" );
                lab.id = this.id + "-lab";
                lab.style.zIndex = "100";
                lab.style.border = "1px solid rgb(221,221,221)";
                lab.style.borderRadius = "5px";
                this.toolbox.querySelector( ".gn8-gradiantor-tool-wrap" ).appendChild( lab );
            }
            var lab = document.getElementById( this.id + "-lab" );
            lab.innerHTML = `
                <div style="display: flex; flex-direction: row; flex: 1; justify-content: center;">
                    <div id="${this.id}-color" style="background-color: ${color}; border: 1px solid rgb(200,200,200); border-radius: 5px; width: 40%; margin: 5%;"></div>
                    <div style="margin: 5%; width: 40%; display:flex; flex-direction:row; align-items: center;">
                        <input value="${percn}" name="percent" id="${this.id}-percent" type="number" min="0" max="100" step="5" style="padding: 5px; border-radius: 5px; border: 1px solid rgb(200,200,200);" >
                        <span style="padding: 3px;" >%</span>
                    </div>
                    ${dlt}
                </div>
            `;
            lab.querySelector( `#${this.id}-percent` ).addEventListener( "change", function (e) {
                let color = window.getComputedStyle( lab.querySelector( `#${this.id}-color` ), null ).getPropertyValue("background-color");
                lab.querySelector( `#${this.id}-color` ).style.backgroundColor = color;
                markr.querySelector( "span" ).style.backgroundColor = color;
                for (let index = 0; index < this.colors.length; index++) {
                    const c = this.colors[index];
                    if ( c[2] == clrid ) {
                        var cIndex = index;
                        break;
                    }
                }
                updateColor( {
                    "id" : clrid,
                    "index" : cIndex,
                    "color" : color,
                    "percnt": parseInt( e.currentTarget.value )
                } );
            }.bind( this ) );
            lab.querySelector( `#${this.id}-color` ).addEventListener( "click", function (e) {
                var data = {
                    "id" : null,
                    "container" : this.toolbox,
                    "value" : window.getComputedStyle( e.currentTarget, null ).getPropertyValue("background-color")
                }
                var colorizer = new Gn8Colorize( data );
                colorizer.init().then( success => {
                    let color = success.rgb;
                    lab.querySelector( `#${this.id}-color` ).style.backgroundColor = color;
                    markr.querySelector( "span" ).style.backgroundColor = color;
                    for (let index = 0; index < this.colors.length; index++) {
                        const c = this.colors[index];
                        if ( c[2] == clrid ) {
                            var cIndex = index;
                            break;
                        }
                    }
                    updateColor( {
                        "id" : clrid,
                        "index" : cIndex,
                        "color" : color,
                        "percnt": parseInt( lab.querySelector( `#${this.id}-percent` ).value )
                    } );
                },error => {} );
            }.bind( this ) );
            lab.querySelector( `#${this.id}-delete` ).addEventListener( "click", function (e) {
                for (let index = 0; index < this.colors.length; index++) {
                    const c = this.colors[index];
                    if ( c[2] == clrid ) {
                        var cIndex = index;
                        break;
                    }
                }
                if ( this.colors.length > 2 ) {
                    this.colors.splice(cIndex, 1);
                    drawGradient( this.colors );
                    lab.remove();
                }
            }.bind( this ) );
        }.bind( this );

        var updateColor = function ( data ) {
            if ( typeof data.index != typeof undefined ) {
                this.colors[ data.index ] = [
                    data.color, data.percnt, data.id
                ]
            }else{

            }
            var colors = sortColors( this.colors );
            drawGradient( colors );
        }.bind( this );

        var sortColors = function ( colors ) {
            colors.sort( function( a, b ) {
                return a[1] - b[1];
            } );
            return colors;
        }

        var rotateGradient = function () {
            var rotate = this.toolContainer.querySelector( ".gn8-gradiantor-rotate" );
            rotate.addEventListener( "mousedown", function (e) {
                if ( e.currentTarget != e.target ) return;
                e.stopPropagation();
                this.lastPosition.x = e.pageX;
                this.lastPosition.y = e.pageY;
                e.currentTarget.classList.add( "gn8-gradiantor-rotating" );
            }.bind( this ) );
            rotate.addEventListener( "mousemove", function (e) {
                if ( !e.currentTarget.classList.contains( "gn8-gradiantor-rotating" ) ) return;
                e.stopImmediatePropagation();
                if ( !this.timer || this.timer < Date.now() - 10 ) {
                    var isRight = false;
                    if ( e.pageX >= this.rotateRect[ "left" ] + this.rotateRect[ "width" ] / 2 ) {
                        isRight = true;
                    }
                    var isBottom = false;
                    if ( e.pageY >= this.rotateRect[ "top" ] + this.rotateRect[ "height" ] / 2 ) {
                        isBottom = true;
                    }
                    var toRight = false;
                    var toBottom = false;
                    if ( e.pageX > this.lastPosition.x ) toRight = true;
                    if ( e.pageY > this.lastPosition.y ) toBottom = true;
                    var isHorizental = false;
                    if ( Math.abs( e.pageX - this.lastPosition.x ) > Math.abs( e.pageY - this.lastPosition.y ) ) isHorizental = true;
                    var increase = false;
                    if ( isHorizental ) {
                        if ( isBottom ) {
                            if ( !toRight ) increase = true;
                        }else{
                            if ( toRight ) increase = true;
                        }
                    }else{
                        if ( isRight ) {
                            if( toBottom ) increase = true;
                        }else{
                            if( !toBottom ) increase = true;
                        }
                    }
                    var displace = ( Math.sqrt( 
                        Math.abs( e.pageX - this.lastPosition.x ) ** 2 + 
                        Math.abs( e.pageY - this.lastPosition.y ) ** 2 
                    ) / this.rotateEnvironment ) * 360;
                    if ( !increase ) displace *= -1;
                    this.angle += displace;
                    this.timer = Date.now();
                    this.angle = this.angle % 360;
                    this.lastPosition.x = e.pageX;
                    this.lastPosition.y = e.pageY;
                    fitGradient( this.angle );
                    drawGradient( this.colors );
                }
            }.bind( this ) );
            rotate.addEventListener( "mouseout", function (e) {
                mouseup(e);
            }.bind( this ) );
            rotate.addEventListener( "mouseup", function (e) {
                mouseup(e);
            }.bind( this ) );
        }.bind( this );

        var mouseup = function (e) {
            e.currentTarget.classList.remove( "gn8-gradiantor-rotating" );
            this.lastPosition.x = e.pageX;
            this.lastPosition.y = e.pageY;
        }.bind( this );
        
        var x = 1.6;
        var width = this.toolContainer.offsetWidth;
        var height = this.toolContainer.offsetHeight;
        this.toolContainer.innerHTML = `
            <div class="gn8-gradiantor-rotate"></div>
            <div class="gn8-gradiantor-frame"></div>
            <div class="gn8-gradiantor-gradient-container">
                <div class="gn8-gradiantor-gradient-steps">
                </div>
            </div>
        `;
        var rotate = this.toolContainer.querySelector( ".gn8-gradiantor-rotate" );
        rotate.style.width = width + "px";
        rotate.style.height = height + "px";
        rotate.style.left = "0px";
        rotate.style.top = "0px";
        this.rotateRect = rotate.getBoundingClientRect();
        this.rotateEnvironment = Math.PI * width;
        var frame = this.toolContainer.querySelector( ".gn8-gradiantor-frame" );
        frame.style.width = width / x + "px";
        frame.style.height = height / x + "px";
        frame.style.left = ( width - width / x ) / 2 + "px";
        frame.style.top = ( height - height / x ) / 2 + "px";
        this.colors = sortColors( this.colors );
        fitGradient( this.angle );
        drawGradient( this.colors );
        rotateGradient();
    }
    radial () {
        var collectString = function () {
            var colors = [];
            this.colors.forEach( color => {
                var percent = "";
                if ( color[1] || color[1] === 0 ) percent = color[1] + "%";
                colors.push( `${color[0]} ${percent}` );
            } );
            colors = colors.join();
            if ( !this.isRepeating ) {
                this.string = `radial-gradient(${this.shape} ${this.size} at ${this.center.x}% ${this.center.y}%,${colors})`;
            }else{
                this.string = `repeating-radial-gradient(${this.shape} ${this.size} at ${this.center.x}% ${this.center.y}%deg,${colors})`;
            }
            console.log(this.string);
        }.bind( this );

        var addColor = function ( index, color, percent, id ) {
            var steps = this.toolContainer.querySelector( ".gn8-gradiantor-gradient-steps" );
            var maxHeight = steps.offsetHeight;
            var mark = document.createElement( "div" );
            mark.classList.add( "gn8-gradiantor-picker-cursor" );
            mark.innerHTML = `<span style="display: inline; background-color: ${color};" ></span>`;
            mark.setAttribute( "data-color-index", index );
            mark.setAttribute( "data-color-percn", percent );
            mark.setAttribute( "data-color-id", id );
            steps.appendChild( mark );
            var top = percent - ( ( mark.offsetHeight / 2 ) / maxHeight ) * 100;
            if ( ( ( percent / 100 ) * maxHeight + mark.offsetHeight ) > maxHeight ) {
                top = ( ( maxHeight - mark.offsetHeight ) / maxHeight ) * 100;
            }
            if ( ( ( percent / 100 ) * maxHeight - mark.offsetHeight ) < 0 ) {
                top = 0;
            }
            mark.style.top = top + "%";
            mark.addEventListener( "click", function ( e ) {
                manageColor( e );
            } );
        }.bind( this );

        var manageColor = function (e) {
            var markr = e.currentTarget;
            var color = window.getComputedStyle( markr.querySelector( "span" ), null ).getPropertyValue("background-color");
            var percn = parseInt( markr.getAttribute( "data-color-percn" ) );
            var clrid = markr.getAttribute( "data-color-id" );
            var index = markr.getAttribute( "data-color-index" );
            var disabled = "";
            var dlt = `<div id="${this.id}-delete" style="margin: 5%; font-size: 2em; color: red; cursor: pointer;">&times;</div>`;
            if ( parseInt( index ) == 0 || index == this.colors.length - 1 ) {
                dlt = `<div id="${this.id}-delete" style="margin: 5%; font-size: 2em; color: rgba(0,0,0,.2); cursor: not-allowed;">&times;</div>`;
            }
            this.toolbox.querySelectorAll( ".gn8-gradiantor-picker-cursor" ).forEach( element => {
                element.classList.remove( "active" );
            } );
            markr.classList.add( "active" );
            if ( !document.getElementById( this.id + "-lab" ) ) {
                var lab = document.createElement( "div" );
                lab.id = this.id + "-lab";
                lab.style.zIndex = "100";
                this.toolbox.appendChild( lab );
            }
            var lab = document.getElementById( this.id + "-lab" );
            lab.innerHTML = `
                <div style="display: flex; flex-direction: row; flex: 1; justify-content: center;">
                    <div id="${this.id}-color" style="background-color: ${color}; border: 1px solid rgb(200,200,200); border-radius: 5px; width: 40%; margin: 5%;"></div>
                    <div style="margin: 5%; width: 40%; display:flex; flex-direction:row; align-items: center;">
                        <input value="${percn}" name="percent" id="${this.id}-percent" type="number" min="0" max="100" step="5" style="padding: 5px; border-radius: 5px; border: 1px solid rgb(200,200,200);" ${disabled} >
                        <span style="padding: 3px;" >%</span>
                    </div>
                    ${dlt}
                </div>
                <div class="gn8-gradiantor-wrap" ></div>
            `;
            lab.querySelector( `#${this.id}-percent` ).addEventListener( "change", function (e) {
                let color = window.getComputedStyle( lab.querySelector( `#${this.id}-color` ), null ).getPropertyValue("background-color");
                lab.querySelector( `#${this.id}-color` ).style.backgroundColor = color;
                markr.querySelector( "span" ).style.backgroundColor = color;
                for (let index = 0; index < this.colors.length; index++) {
                    const c = this.colors[index];
                    if ( c[2] == clrid ) {
                        var cIndex = index;
                        break;
                    }
                }
                updateColor( {
                    "id" : clrid,
                    "index" : cIndex,
                    "color" : color,
                    "percnt": parseInt( e.currentTarget.value )
                } );
            }.bind( this ) );
            lab.querySelector( `#${this.id}-color` ).addEventListener( "click", function (e) {
                var data = {
                    "id" : null,
                    "container" : this.toolbox,
                    "value" : window.getComputedStyle( e.currentTarget, null ).getPropertyValue("background-color")
                }
                var colorizer = new Gn8Colorize( data );
                colorizer.init().then( success => {
                    let color = success.rgb;
                    lab.querySelector( `#${this.id}-color` ).style.backgroundColor = color;
                    markr.querySelector( "span" ).style.backgroundColor = color;
                    for (let index = 0; index < this.colors.length; index++) {
                        const c = this.colors[index];
                        if ( c[2] == clrid ) {
                            var cIndex = index;
                            break;
                        }
                    }
                    updateColor( {
                        "id" : clrid,
                        "index" : cIndex,
                        "color" : color,
                        "percnt": parseInt( lab.querySelector( `#${this.id}-percent` ).value )
                    } );
                },error => {} );
            }.bind( this ) );
            lab.querySelector( `#${this.id}-delete` ).addEventListener( "click", function (e) {
                for (let index = 0; index < this.colors.length; index++) {
                    const c = this.colors[index];
                    if ( c[2] == clrid ) {
                        var cIndex = index;
                        break;
                    }
                }
                if ( this.colors.length > 2 ) {
                    this.colors.splice(cIndex, 1);
                    drawGradient( this.colors );
                    lab.remove();
                }
            }.bind( this ) );
        }.bind( this );

        var updateColor = function ( data ) {
            if ( typeof data.index != typeof undefined ) {
                this.colors[ data.index ] = [
                    data.color, data.percnt, data.id
                ]
            }else{

            }
            var colors = sortColors( this.colors );
            drawGradient( colors );
        }.bind( this );

        var sortColors = function ( colors ) {
            colors.sort( function( a, b ) {
                return a[1] - b[1];
            } );
            return colors;
        }

        var fitGradient = function () {
            var frame = this.toolContainer.querySelector( ".gn8-gradiantor-frame" );
            var width = frame.offsetWidth;
            var height = frame.offsetHeight;
            var startPointX = ( this.center.x / 100 ) * width;
            var startPointY = ( this.center.y / 100 ) * height;
            if ( this.size == "farthest-corner" ){
                var direction = -1;
                var endPointX = 0;
                if ( this.center.x < 50 ) {
                    endPointX = width;
                    direction = 1
                }
                var endPointY = 0;
                var deg = ( 
                    Math.atan ( 
                        Math.abs( endPointX - startPointX ) / Math.abs( endPointY - startPointY ) 
                    ) * 180 ) / Math.PI;
                if ( this.center.y < 50 ) {
                    endPointY = height;
                    var deg = ( 
                        Math.atan ( 
                            Math.abs( endPointY - startPointY ) / Math.abs( endPointX - startPointX ) 
                        ) * 180 ) / Math.PI + 90;
                }
                deg = deg * direction;
                deg += 180;
                var theHeight = Math.sqrt( Math.abs( endPointX - startPointX ) ** 2 + Math.abs( endPointY - startPointY ) ** 2 );
            } else {
                var x = ( this.center.x / 100 ) * width;
                var y = ( this.center.y / 100 ) * height;
                if ( this.center.x >= 50 ) x = width - x;
                if ( this.center.y >= 50 ) y = height - y;
                if ( x < y ) {
                    var endPointX = 0;
                    var deg = 90;
                    if ( this.center.x >= 50 ) {
                        endPointX = width;
                        var deg = -90 ;
                    }
                    var endPointY = startPointY;
                    var theHeight = x;
                } else {
                    var endPointX = startPointX;
                    var endPointY = 0;
                    var deg = 180;
                    if ( this.center.y >= 50 ) {
                        endPointY = height;
                        var deg = 0;
                    }
                    var theHeight = y;
                }                
            }
            var gradient = this.toolContainer.querySelector( ".gn8-gradiantor-radial-gradient-container" );
            gradient.style.width = "12px";
            gradient.style.height = theHeight + "px";
            gradient.style.left = ( startPointX - 6 ) + "px";
            gradient.style.top = startPointY + "px";
            gradient.style.webkitTransform = 'rotate('+deg+'deg)';
            gradient.style.mozTransform    = 'rotate('+deg+'deg)';
            gradient.style.msTransform     = 'rotate('+deg+'deg)';
            gradient.style.oTransform      = 'rotate('+deg+'deg)'; 
            gradient.style.transform = 'rotate('+deg+'deg)';
        }.bind( this );

        var drawGradient = function ( colors ) {
            colors = sortColors( colors );
            var frame = this.toolContainer.querySelector( ".gn8-gradiantor-frame" );
            var gradient = this.toolContainer.querySelector( ".gn8-gradiantor-radial-gradient-container" );
            var stepsContainer = gradient.querySelector( ".gn8-gradiantor-gradient-steps" );
            stepsContainer.innerHTML = `<canvas id="${this.id}-gradient-canvas" width="10" height="${stepsContainer.offsetHeight}"></canvas>`;
            var canvas = document.getElementById( `${this.id}-gradient-canvas` );
            var ctx = canvas.getContext("2d");
            var grd = ctx.createLinearGradient(0, 0, 0, stepsContainer.offsetHeight);

            // Fill with gradient
            var colorsArray = [];
            for (let index = 0; index < colors.length; index++) {
                const color = colors[index];
                colorsArray.push( `${color[0]} ${color[1]}%` );
            }
            for (let index = colors.length - 1; index >= 0; index--) {
                const color = colors[index];
                grd.addColorStop( color[1] / 100, color[0] );
                addColor( index, color[0], color[1], color[2] );
            }
            ctx.fillStyle = grd;
            ctx.fillRect(0, 0, 10, stepsContainer.offsetHeight);
            
            if ( this.isRepeating ) {
                var realBackgroundImage = `repeating-radial-gradient(${this.shape} ${this.size} at ${this.center.x}% ${this.center.y}%,${colorsArray.join(",")})`;
            }else{
                var realBackgroundImage = `radial-gradient(${this.shape} ${this.size} at ${this.center.x}% ${this.center.y}%,${colorsArray.join(",")})`;
            }
            frame.style.backgroundImage = realBackgroundImage;
            canvas.addEventListener( "click", function (e) {
                var c = e.currentTarget || e.target;
                var ctx = c.getContext("2d"); 
                var imgData = ctx.getImageData( e.offsetX, e.offsetY, 1, 1 );
                var color = `rgba(${imgData.data[0]},${imgData.data[1]},${imgData.data[2]},${imgData.data[3]})`;
                var percent = ( ( e.offsetY ) / c.height ) * 100;
                var id = this.idFunction();
                this.colors.push( [ color, percent, id ] );
                drawGradient( this.colors );
            }.bind( this ) );
            collectString();
        }.bind( this );
        var circleSelected = "";
        if ( this.shape == "circle" ) circleSelected = "checked";
        var containSelected = "";
        if ( this.size == "closest-side" ) containSelected = "checked";
        var coverSelected = "";
        if ( this.size == "farthest-corner" ) coverSelected = "checked";
        var width = this.toolContainer.offsetWidth;
        var height = this.toolContainer.offsetHeight;
        this.toolContainer.innerHTML = `
            <div class="gn8-gradiantor-frame radial"></div>
            <div class="gn8-gradiantor-radial-gradient-container">
                <div class="gn8-gradiantor-gradient-steps">
                </div>
            </div>
            <ul class="gn8-gradiantor-radial-list" >
                <div class="items" >                
                    <p style="font-size:.8em; width: 100%">Coverage:</p>
                    <li style="display: flex; flex-direction: row; align-items: center; margin-left: 10px;" > 
                        <input type="radio" id="${this.id}-is-contain" name="coverage" value="closest-side" ${containSelected} > 
                        <label for="${this.id}-is-contain" style="font-size:.8em;">Contain</label>
                        <input type="radio" id="${this.id}-is-cover"  name="coverage" value="farthest-corner" ${coverSelected} > 
                        <label for="${this.id}-is-cover" style="font-size:.8em;">Cover</label>  
                    </li>
                </div>
                <div class="items" >
                    <p style="font-size:.8em; width: 100%">Shape:</p>
                    <li style="display: flex; flex-direction: row; align-items: center; margin-left: 10px;" > 
                        <input type="checkbox" id="${this.id}-is-circle" ${circleSelected} > 
                        <label for="${this.id}-is-circle" style="font-size:.8em;">Circle</label>                        
                    </li>
                </div>
            </ul>
        `;
        this.toolContainer.querySelectorAll( "[name='coverage']" ).forEach( element => {
            element.addEventListener( "change", function (e) {
                this.size = this.toolContainer.querySelector( "[name='coverage']:checked" ).value;
                fitGradient();
                drawGradient( this.colors );
            }.bind( this ) );
        } );
        this.toolContainer.querySelector( `#${this.id}-is-circle` ).addEventListener( "change", function (e) {
            this.shape = "ellipse";
            if ( e.target.checked ) {
                this.shape = "circle";
            }
            fitGradient();
            drawGradient( this.colors );
        }.bind( this ) );
        var frame = this.toolContainer.querySelector( ".gn8-gradiantor-frame" );
        frame.style.width = width + "px";
        frame.style.height = height - 70 + "px";
        frame.style.left = 0 + "px";
        frame.style.top = 0 + "px";         
        var frameMatrix = frame.getBoundingClientRect();       
        frame.addEventListener( "click", function (e) {
            e.stopPropagation();
            var x = e.pageX - frameMatrix[ "left" ];
            var y = e.pageY - frameMatrix[ "top" ];
            this.center.x = ( x / frameMatrix[ "width" ] ) * 100;
            this.center.y = ( y / frameMatrix[ "height" ] ) * 100;
            fitGradient();
            drawGradient( this.colors );
        }.bind( this ) );
        this.colors = sortColors( this.colors );
        fitGradient();
        drawGradient( this.colors );
    }
    idFunction ( l ) {
        if( !l ){
            l = 31;
        }else{
            l = parseInt(l) - 1;
        }
        var r = "";
        var p = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456789";
        var f = "abcdefghijklmnopqrstuvwxyz";
        for (var i = 0; i < l; i++){
            r += p.charAt(Math.floor(Math.random() * p.length));
        }
        r = f.charAt(Math.floor(Math.random() * f.length)) + r;
        return r;
    }
}
