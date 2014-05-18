<?php

/**
 * 
 *
 * @author <marcus@silverstripe.com.au>
 * @license BSD License http://www.silverstripe.org/bsd-license
 */
class ItchAdmin extends ModelAdmin {
	private static $url_segment = 'scratch';
	private static $menu_title = 'Scratch';
	private static $managed_models = array('Itch');
}
