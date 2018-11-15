<?php

namespace App\Models\FileSystems\PlatformHelpers\Sizes;

class Calculator
{
    protected static $instance;
    protected $maxDigitsAddDiv = 0;
    protected $maxDigitsMul = 0;

	/**
	 * @return Calculator
	 */
	public static function GetInstance () {
        if (self::$instance === null) 
            self::$instance = new static();
        return self::$instance;
    }

    public function __construct() {
        switch (PHP_INT_SIZE) {
            case 4:
                $this->maxDigitsAddDiv = 9;
                $this->maxDigitsMul = 4;
                break;
            case 8:
                $this->maxDigitsAddDiv = 18;
                $this->maxDigitsMul = 9;
                break;
        }
    }

    /**
     * @param string $a 
     * @param string $b 
     * @return string
     */
    public function Addition ($a, $b) {
        if ($a === '0') return $b;
        if ($b === '0') return $a;
        $this->init($a, $b, $aDig, $bDig, $aNeg, $bNeg, $aLen, $bLen);
        if ($aLen <= $this->maxDigitsAddDiv && $bLen <= $this->maxDigitsAddDiv) 
            return (string) ((int) $a + (int) $b);
        if ($aNeg === $bNeg) {
            $result = $this->doAddition($aDig, $bDig, $aLen, $bLen);
        } else {
            $result = $this->doSubtraction($aDig, $bDig, $aLen, $bLen);
        }
        if ($aNeg) 
            $result = $this->Negation($result);
        return $result;
    }

    /**
     * @param string $a 
     * @param string $b 
     * @return string
     */
    public function Subtraction ($a, $b) {
        return $this->Addition($a, $this->Negation($b));
    }

    /**
     * @param string $a 
     * @param string $b 
     * @return \string[]
     */
    public function DivisionQuocientAndReminder ($a, $b) { // quocient and reminder
        if ($a === '0')  return ['0', '0'];
        if ($a === $b)   return ['1', '0'];
        if ($b === '1')  return [$a, '0'];
        if ($b === '-1') return [$this->Negation($a), '0'];
        $this->init($a, $b, $aDig, $bDig, $aNeg, $bNeg, $aLen, $bLen);
        if ($aLen <= $this->maxDigitsAddDiv && $bLen <= $this->maxDigitsAddDiv) {
            $a = (int) $a;
            $b = (int) $b;
            $r = $a % $b;
            $q = ($a - $r) / $b;
            $q = (string) $q;
            $r = (string) $r;
            return [$q, $r];
        }
        list($q, $r) = $this->doDivision($aDig, $bDig, $aLen, $bLen);
        if ($aNeg !== $bNeg) 
            $q = $this->Negation($q);
        if ($aNeg) 
            $r = $this->Negation($r);
        return [$q, $r];
    }

	/**
	 * @param string $a 
	 * @param string $b 
	 * @param string $aDig 
	 * @param string $bDig 
	 * @param string $aNeg 
	 * @param string $bNeg 
	 * @param int $aLen 
	 * @param int $bLen 
	 * @return void
	 */
	protected function init ($a, $b, & $aDig, & $bDig, & $aNeg, & $bNeg, & $aLen, & $bLen) {
        $aNeg = ($a[0] === '-');
        $bNeg = ($b[0] === '-');
        $aDig = $aNeg 
			? substr($a, 1) 
			: $a;
        $bDig = $bNeg 
			? substr($b, 1) 
			: $b;
        $aLen = strlen($aDig);
        $bLen = strlen($bDig);
    }

    /**
     * @param string $n 
     * @return string
     */
    public function Negation ($n) {
        if ($n === '0') return '0';
        if ($n[0] === '-') return substr($n, 1);
        return '-' . $n;
    }

    protected function doAddition ($a, $b, $x, $y) {
        $length = $this->padZeros($a, $b, $x, $y);
        $carry = 0;
        $result = '';
        for ($i = $length - 1; $i >= 0; $i--) {
            $sum = (int) $a[$i] + (int) $b[$i] + $carry;
            if ($sum >= 10) {
                $carry = 1;
                $sum -= 10;
            } else {
                $carry = 0;
            }
            $result .= $sum;
        }
        if ($carry !== 0) 
            $result .= $carry;
        return strrev($result);
    }

    protected function doSubtraction ($a, $b, $x, $y) {
        if ($a === $b) {
            return '0';
        }
        $cmp = $this->doComparison($a, $b, $x, $y);
        $invert = ($cmp === -1);
        if ($invert) {
            $c = $a;
            $a = $b;
            $b = $c;
            $z = $x;
            $x = $y;
            $y = $z;
        }
        $length = $this->padZeros($a, $b, $x, $y);
        $carry = 0;
        $result = '';
        for ($i = $length - 1; $i >= 0; $i--) {
            $sum = (int) $a[$i] - (int) $b[$i] - $carry;
            if ($sum < 0) {
                $carry = 1;
                $sum += 10;
            } else {
                $carry = 0;
            }
            $result .= $sum;
        }
        $result = strrev($result);
        $result = ltrim($result, '0');
        if ($invert) 
            $result = $this->Negation($result);
        return $result;
    }

	protected function doDivision ($a, $b, $x, $y) {
        $cmp = $this->doComparison($a, $b, $x, $y);
        if ($cmp === -1) return ['0', $a];
        $q = '0';
        $r = $a;
        $z = $y;
        for (;;) {
            $focus = substr($a, 0, $z);
            $cmp = $this->doComparison($focus, $b, $z, $y);
            if ($cmp === -1) {
                if ($z === $x) break;
                $z++;
            }
            $zeros = str_repeat('0', $x - $z);
            $q = $this->Addition($q, '1' . $zeros);
            $a = $this->Subtraction($a, $b . $zeros);
            $r = $a;
            if ($r === '0') {
                break;
            }
            $x = strlen($a);
            if ($x < $y) break;
            $z = $y;
        }
        return [$q, $r];
    }

    protected function doComparison ($a, $b, $x, $y) {
        if ($x > $y) return 1;
        if ($x < $y) return -1;
        for ($i = 0; $i < $x; $i++) {
            $ai = (int) $a[$i];
            $bi = (int) $b[$i];
            if ($ai > $bi) return 1;
            if ($ai < $bi) return -1;
        }
        return 0;
    }

    protected function padZeros (& $a, & $b, $x, $y) {
        if ($x === $y) return $x;
        if ($x < $y) {
            $a = str_repeat('0', $y - $x) . $a;
            return $y;
        }
        $b = str_repeat('0', $x - $y) . $b;
        return $x;
    }
}
