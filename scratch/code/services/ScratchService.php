<?php

/**
 * 
 *
 * @author <marcus@silverstripe.com.au>
 * @license BSD License http://www.silverstripe.org/bsd-license
 */
class ScratchService {
	public function webEnabledMethods() {
		return array();
	}
	
	public function updatesSince($date) {
		$date = gmdate('Y-m-d H:i:s', strtotime($date));
		
		return $date;
	}
	
	
	public function save($itches) {
		$toLoad = array_keys($itches);
		$toUpdate = Itch::get()->filter('Guid', $toLoad);
		
		$updates = 0;
		$newitches = 0;
		
		foreach ($toUpdate as $itch) {
			++$updates;
			$updateData = $itches[$itch->Guid];
			unset($updateData['id']);
			$itch->Title = isset($updateData['data']['title']) ? $updateData['data']['title'] : $itch->Title;
			$itch->ItchData = $updateData;
			$itch->write();
			unset($itches[$itch->Guid]);
			
		}
		
		foreach ($itches as $guid => $new) {
			++$newitches;
			
			unset($new['id']);
			$title = isset($new['data']['title']) ? $new['data']['title'] : "Itch $guid";
			$itch = Itch::create(array(
				'Guid'			=> $guid,
				'Title'			=> $title,
				'ItchData'		=> $new,
			));
			$itch->write();
		}
		
		return array('updates' => $updates, 'new' => $newitches);
	}
}
