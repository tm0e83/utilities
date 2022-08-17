
Usage:
------------------------
<market-item-countdown time="2020-08-24 14:58:21">
</market-item-countdown>


Attributes:
------------------------
  time: a time string that can be used to create a Date object
  small: has no value; smaller version of the countdown


Implementation Example:
------------------------
<?php echo $this->partial('application/web-components/market-item-countdown/market-item-countdown.phtml'); ?>

<market-item-countdown time="<?php echo date('d.m.Y h:i', strtotime($offer->valid_until)); ?>"></market-item-countdown>