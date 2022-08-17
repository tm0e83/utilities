
Usage:
------------------------
<clip-text>
  <span class="text">Text</span>
  <i class="toggle"></i>
</clip-text>


Attributes:
------------------------
-

Implementation Example:
------------------------
<?php echo $this->partial('application/web-components/clip-text/clip-text.phtml'); ?>

<clip-text>
  <span class="text"><?php echo $this->translate('Lorem ipsum dolor sit amet, consetetur sadipscing elitr.'); ?></span>
  <i class="toggle"></i>
</clip-text>