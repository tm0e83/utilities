
Usage:
------------------------
<tool-tip title="This is a Tooltip!">
  hover me
</tool-tip>


Attributes:
------------------------
  title: the actual content of the tooltip. Use php's rawurlencode() in order to use special characters


Implementation Example:
------------------------
<?php echo $this->partial('application/web-components/tool-tip/tool-tip.phtml'); ?>

<tool-tip title="<?php echo rawurlencode($this->translate('TOOLTIP "TEXT" CONTENT HERE')); ?>">
  <?php echo $this->translate('TRIGGER TEXT HERE'); ?>
</tool-tip>