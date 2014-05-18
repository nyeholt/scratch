<?php

/**
 * 
 *
 * @author <marcus@silverstripe.com.au>
 * @license BSD License http://www.silverstripe.org/bsd-license
 */
class Itch extends DataObject {
	private static $db = array(
		'Title'				=> 'Varchar(255)',
		'Guid'				=> 'Varchar(128)',
		'LastEditedUTC'		=> 'SS_Datetime',
		'CreatedUTC'		=> 'SS_Datetime',
		'ItchData'			=> 'MultiValueField',
	);
	
	private static $summary_fields = array(
		'Title', 'Guid', 'LastEditedUTC',
	);
	
	public function onBeforeWrite() {
		parent::onBeforeWrite();
		
		if (!$this->CreatedUTC && $this->Created) {
			$this->CreatedUTC = gmdate('Y-m-d H:i:s', strtotime($this->Created));
		}
		$this->LastEditedUTC = gmdate('Y-m-d H:i:s');
		
	}
	
	public function getCMSFields() {
		$fields = parent::getCMSFields();
		
		$fields->removeByName('ItchData');
		$data = json_encode($this->ItchData->getValues());
		$fields->push(TextareaField::create('ItchDataView', 'Itch data', $data));
		return $fields;
	}
}
