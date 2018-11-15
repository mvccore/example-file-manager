<?php

namespace Libs;

class StringConverter
{
	/*public static function ToUnicodeIndexes ($string, $trimZeros = FALSE) {
		$resultStringArr = [];
		for ($i = 0, $l = strlen($string); $i < $l; $i++) {
			$char = mb_substr($string, $i, 1, 'UTF-8');
			if (mb_check_encoding($char, 'UTF-8')) {
				$ret = mb_convert_encoding($char, 'UTF-32BE', 'UTF-8');
				$resultStringArr[] = hexdec(bin2hex($ret));
			}
		}
		if ($trimZeros) {
			while ($resultStringArr[count($resultStringArr) - 1] === 0) {
				unset($resultStringArr[count($resultStringArr) - 1]);
			}
			while ($resultStringArr[0] === 0) {
				array_shift($resultStringArr);
			}
		}
		return $resultStringArr;
	}

	public static function FromUnicodeIndexes ($arr) {
		return array_reduce($arr, function($a, $b) {
			$a .= chr($b);
			return $a;
		}, '');
	}*/

	public static function ToUtf8 ($str) {
		$currentEncoding = mb_detect_encoding($str, 'auto');
		$result = iconv($currentEncoding, 'UTF-8//TRANSLIT', $str);
		if ($result === FALSE) {
			//x([$str, debug_backtrace()]);
			// detect UTF-8
			if (preg_match('#[\x80-\x{1FF}\x{2000}-\x{3FFF}]#u', $str)) {
				$result = $str;
			// detect WINDOWS-1250
			} else if (preg_match('#[\x7F-\x9F\xBC]#', $str)) {
				$result = iconv('WINDOWS-1250', 'UTF-8', $str);
			// assume ISO-8859-2
			} else {
				$result = iconv('ISO-8859-2', 'UTF-8', $str);
				if ($result === FALSE) 
					$result = utf8_encode($str);
			}
		}
		return $result;
	}

	public static function ToUtf8Recursive ($data)  {
		if (is_string($data)) {
			return self::ToUtf8($data);
		} else if (is_array($data)) {
			$ret = [];
			foreach ($data as $key => $value) 
				$ret[$key] = self::ToUtf8Recursive($value);
			return $ret;
		} else if (is_object($data)) {
			foreach ($data as $key => $value) 
				$data->{$key} = self::ToUtf8Recursive($value);
			return $data;
		} else {
			return $data;
		}
	}
}
