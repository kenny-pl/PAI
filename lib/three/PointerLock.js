/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.PointerLockControls = function ( camera ) {

	var scope = this;
	var moveSpeed = 100.0;

	camera.rotation.set( 0, 0, 0 );

	var pitchObject = new THREE.Object3D();
	pitchObject.add( camera );

	var yawObject = new THREE.Object3D();
	yawObject.add( pitchObject );

	var moveForward = false;
	var moveBackward = false;
	var moveLeft = false;
	var moveRight = false;

	var isOnObject = false;
	var canJump = false;

	var prevTime = performance.now();

	var velocity = new THREE.Vector3();
	this.collisionFlags = {};

	var PI_2 = Math.PI / 2;

	var onMouseMove = function ( event ) {

		if ( scope.enabled === false ) return;

		var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

		yawObject.rotation.y -= movementX * 0.002;
		pitchObject.rotation.x -= movementY * 0.002;

		pitchObject.rotation.x = Math.max( - PI_2, Math.min( PI_2, pitchObject.rotation.x ) );

	};

	var onKeyDown = function ( event ) {

		switch ( event.keyCode ) {

			case 38: // up
			case 87: // w
				moveForward = true;
				break;

			case 37: // left
			case 65: // a
				moveLeft = true; break;

			case 40: // down
			case 83: // s
				moveBackward = true;
				break;

			case 39: // right
			case 68: // d
				moveRight = true;
				break;

			case 32: // space
				if ( canJump === true ) velocity.y += 350;
				canJump = false;
				break;

		}

	};

	var onKeyUp = function ( event ) {

		switch( event.keyCode ) {

			case 38: // up
			case 87: // w
				moveForward = false;
				break;

			case 37: // left
			case 65: // a
				moveLeft = false;
				break;

			case 40: // down
			case 83: // s
				moveBackward = false;
				break;

			case 39: // right
			case 68: // d
				moveRight = false;
				break;

		}

	};

	document.addEventListener( 'mousemove', onMouseMove, false );
	document.addEventListener( 'keydown', onKeyDown, false );
	document.addEventListener( 'keyup', onKeyUp, false );

	this.enabled = false;

	this.getYawObject = function () {
		return yawObject;

	};
	
	this.getPitchObject = function() {
		return pitchObject;
	}

	this.isOnObject = function ( boolean ) {

		isOnObject = boolean;
		canJump = boolean;

	};

	this.getDirection = function() {

		// assumes the camera itself is not rotated

		var direction = new THREE.Vector3( 0, 0, -1 );
		var rotation = new THREE.Euler( 0, 0, 0, "YXZ" );

		return function( v ) {

			rotation.set( pitchObject.rotation.x, yawObject.rotation.y, 0 );

			v.copy( direction ).applyEuler( rotation );

			return v;

		}

	}();

	this.update = function () {

		if ( scope.enabled === false ) return;

		var time = performance.now();
		var delta = ( time - prevTime ) / 1000;

		velocity.x -= velocity.x * 10.0 * delta;
		velocity.z -= velocity.z * 10.0 * delta;

		velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

		if ( moveForward ) velocity.z -= moveSpeed * delta;
		if ( moveBackward ) velocity.z += moveSpeed * delta;

		if ( moveLeft ) velocity.x -= moveSpeed * delta;
		if ( moveRight ) velocity.x += moveSpeed * delta;

		if ( isOnObject === true ) {

			velocity.y = Math.max( 0, velocity.y );

		}
				
		
		var prevPos = new THREE.Vector3();
		prevPos.copy(yawObject.position);

		yawObject.translateX( velocity.x * delta );
		//yawObject.translateY( velocity.y * delta ); 
		yawObject.translateZ( velocity.z * delta );
		
		var xDiff =  yawObject.position.x - prevPos.x;
		var zDiff =  yawObject.position.z - prevPos.z;
		
		if(xDiff < 0 && this.collisionFlags['-X']) {
			//console.log('-X');
			velocity.x = 0;
			yawObject.position.x = prevPos.x;
		}
		else if(xDiff > 0 && this.collisionFlags['+X']) {
			//console.log('+X');
			velocity.x = 0;
			yawObject.position.x = prevPos.x;
		}
		
		if(zDiff < 0 && this.collisionFlags['-Z']) {
			//console.log('-Z');
			velocity.z = 0;
			yawObject.position.z = prevPos.z;
		}
		else if(zDiff > 0 && this.collisionFlags['+Z']) {
			//console.log('+Z');
			velocity.z = 0;
			yawObject.position.z = prevPos.z;
		}
		
		/*
		if ( yawObject.position.y < -100 ) {

			velocity.y = 0;
			yawObject.position.y = -100;

			canJump = true;

		}
		*/
		
		

		prevTime = time;

	};

};