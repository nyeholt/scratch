<?php

/**
 * 
 *
 * @author <marcus@silverstripe.com.au>
 * @license BSD License http://www.silverstripe.org/bsd-license
 */
class ScratchPage extends Page {
	
}

class ScratchPage_Controller extends Page_Controller {
	public function index() {
		return $this->renderWith('ScratchPage');
	}
}