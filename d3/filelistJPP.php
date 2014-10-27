<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">
<html>
	<head>
		<title>Single File Download Interface</title>
		<link href="http://www.indiana.edu/~gisdata/styles/isdp_style.css" rel="stylesheet" type="text/css"> 
	</head>
	<body>
		<?php

		// echo "in filelist.php.";

		include 'dbConnection.php';
		include 'header.php';

		/*
		<cfquery name="qryAllFiles" datasource="LocalSpatialMssql">
		SELECT * 
		FROM tblAllFiles LEFT JOIN tblDataSets ON tblAllFiles.dsID = tblDataSets.dsID
			LEFT JOIN tblCategory on tblAllFiles.catID = tblCategory.catID
		WHERE ((tblAllFiles.xmin <= '#url.xmax#') AND (tblAllFiles.xmax >= '#url.xmin#')
		  AND  (tblAllFiles.ymin <= '#url.ymax#') AND (tblAllFiles.ymax >= '#url.ymin#'))
		ORDER BY dsPriority, catPriority, FileFormat, FileName, FileSize DESC
		</cfquery>
		*/

		// test values being fetched from URL
		echo "testing " . $_GET['xmax'] . "<br>";
		echo "testing " . $_GET['xmin'] . "<br>";
		echo "testing " . $_GET['ymin'] . "<br>";
		echo "testing " . $_GET['ymax'] . "<br>";
		
		$xmin = $_GET['xmin'];
		$ymin = $_GET['ymin'];
		$xmax = $_GET['xmax'];
		$ymax = $_GET['ymax'];
		

		// translate cfquery name="qryAllFiles" as below:
		$qryAllFiles = "
			SELECT *  FROM tblAllFiles 
			LEFT JOIN tblDataSets
			ON tblAllFiles.dsID = tblDataSets.dsID
			LEFT JOIN tblCategory
			ON tblAllFiles.catID = tblCategory.catID
			WHERE (tblAllFiles.xmin <= '".$xmin."') AND (tblAllFiles.xmax >= '".$xmax."') 
			AND (tblAllFiles.ymin <= '".$ymin."') AND (tblAllFiles.ymax >= '".$ymax."')";


echo "testing " . $qryAllFiles . "<br>";
		// hard-coding xmin, xmax, ymin, ymax values for testing purposes
		/*$qryAllFiles = "SELECT *  FROM `tblAllFiles` 
						LEFT JOIN `tblDataSets` ON `tblAllFiles`.`dsID` = `tblDataSets`.`dsID` 
						LEFT JOIN `tblCategory` ON `tblAllFiles`.`catID` = `tblCategory`.`catID` 
						WHERE (`tblAllFiles`.`xmin` <= 568854) AND (`tblAllFiles`.`xmax` >= 567616) 
								AND (`tblAllFiles`.`ymin` <= 4579481) AND (`tblAllFiles`.`ymax` >= 4578243) 
						ORDER BY `dsPriority`, `catPriority`, `FileFormat`, `FileName`, `FileSize` DESC;";*/

		/*// test query
		$qryAllFiles = "SELECT * FROM `tblAllFiles` 
						LEFT JOIN `tblDataSets` ON `tblAllFiles`.`dsID` = `tblDataSets`.`dsID` 
						LEFT JOIN `tblCategory` ON `tblAllFiles`.`catID` = `tblCategory`.`catID` 
						ORDER BY `dsPriority`, `catPriority`, `FileFormat`, `FileName`, `FileSize` DESC LIMIT 10;";*/

		$dbOutput = mysql_query($qryAllFiles, $connection) or die("'queryAllFiles' unsuccessful: " . mysql_error());

		/*
		<cfquery name="qryProductCount" dbtype="query">
		SELECT COUNT(DISTINCT dsName)
		FROM qryAllFiles
		</cfquery>
		*/

		/* To get the total number of available datasets, translate cfquery name="qryProductCount" as the query below: */
		/*$qryProductCount = "
			SELECT COUNT(DISTINCT dsName) 
			FROM (
					SELECT L.dsID, L.xmin, L.xmax, L.ymin, L.ymax, L.FileFormat, L.FileName, L.FileSize, R.dsName, R.dsPriority, tblCategory.catPriority 
					FROM tblAllFiles AS L LEFT JOIN tblDataSets AS R ON L.dsID = R.dsID LEFT JOIN tblCategory ON L.catID = tblCategory.catID
				) AS nest
			WHERE (nest.xmin <= " . $_GET["xmax"] . " AND nest.xmax >= " . $_GET["xmin"] . " AND nest.ymin <= " . $_GET["ymax"] . " AND nest.ymax >= " . $_GET["ymin"] . 
			" ORDER BY dsPriority, catPriority, FileFormat, FileName, FileSize DESC;
			";*/

		$qryProductCount = "SELECT COUNT(DISTINCT dsName) 
							FROM (
								SELECT L.dsID, L.xmin, L.xmax, L.ymin, L.ymax, L.FileFormat, L.FileName, L.FileSize, R.dsName, R.dsPriority, tblCategory.catPriority 
								FROM tblAllFiles AS L LEFT JOIN tblDataSets AS R ON L.dsID = R.dsID LEFT JOIN tblCategory ON L.catID = tblCategory.catID
								) AS nest
							WHERE nest.xmin <= 568854 AND nest.xmax >= 567616 AND nest.ymin <= 4579481 AND nest.ymax >= 4578243 
							ORDER BY dsPriority, catPriority, FileFormat, FileName, FileSize DESC;";

		$productCount = mysql_query($qryProductCount, $connection) or die("'qryProductCount' unsuccessful: " . mysql_error());

		// result for query '$qryProductCount is just the one integer; store that result as first element of $var array
		$var = mysql_fetch_array($productCount);

		?><!-- end php -->
		
		<div id="main">

			<table width="660">
				<tbody>
					<tr>
						<td>
							<!-- where logged user's information should show -->
						</td>
					</tr>
				</tbody>
			</table>

			<table width="700" border="0" cellspacing="0">
				<tbody>
					<tr valign="top">
						<td> </td>
						<td width="25">&nbsp;</td>
						<td align="left">
							<table width="100%" cellpadding="1" cellspacing="0" border="0">
								<tbody>
									<tr>
										<td height="40" class="page_heading">
											Spatial Datasets within the UTM bounding coordinates of:<br>
											(<?php echo "" . $_GET['xmin'] ."";?>, <?php echo "" . $_GET['ymin'] ."";?>) min by (<?php echo "" . $_GET['xmax'] ."";?>, <?php echo "" . $_GET['ymax'] ."";?>) max in meters
										</td>
									</tr>
									<?php include 'dl_simple_info.php' ?>
								</tbody>
							</table>

							<table>
								<tbody>
									<tr class="section_heading">
										<th align="left">There are <?php echo $var[0] ?> available datasets</th>
									</tr>
								</tbody>
							</table>

							<table width="100%" cellpadding="1" cellspacing="0" border="1" bordercolor="#cccc99" bgcolor="#ffffcc">
								<tbody>
								  	<tr align="center">
										<td>ID</td>
										<td>dsID</td>
										<td>catID</td>
										<td>FileSize</td>
										<td>DatePub</td>
										<td>DatePhotoRev</td>
										<td>Product</td>
										<td>FileFormat</td>
										<td>ArchiveFormat</td>
										<td>Resolution</td>
										<td>CompressRatio</td>
										<td>Quadname</td>
										<td>FileID</td>
										<td>FileName</td>
										<td>URL</td>
										<td>URL2</td>
										<td>Scale</td>
										<td>AltID</td>
										<td>xmin</td>
										<td>xmax</td>
										<td>ymin</td>
										<td>ymax</td>
										<td>projection</td>
										<td>units</td>
										<td>dsID</td>
										<td>dsName</td>
										<td>dsCreator</td>
										<td>dsLocation</td>
										<td>dsType</td>
										<td>dsDate</td>
										<td>dsURL</td>
										<td>dsPriority</td>
										<td>dsThumb</td>
										<td>Restricted</td>
										<td>Selectable</td>
										<td>catID</td>
										<td>catName</td>
										<td>catPriority</td>
										<td>Restricted</td>
										<td>Selectable</td>
									</tr>
									<?php 
										while ($qryResultsArray = mysql_fetch_assoc($dbOutput)) {
											print "<tr align = \"center\">";
											print "<td>" . $qryResultsArray['ID'] . "</td>";
											print "<td>" . $qryResultsArray['dsID'] . "</td>";
											print "<td>" . $qryResultsArray['catID'] . "</td>";
											print "<td>" . $qryResultsArray['FileSize'] . "</td>";
											print "<td>" . $qryResultsArray['DatePub'] . "</td>";
											print "<td>" . $qryResultsArray['DatePhotoRev'] . "</td>";
											print "<td>" . $qryResultsArray['Product'] . "</td>";
											print "<td>" . $qryResultsArray['FileFormat'] . "</td>";
											print "<td>" . $qryResultsArray['ArchiveFormat'] . "</td>";
											print "<td>" . $qryResultsArray['Resolution'] . "</td>";
											print "<td>" . $qryResultsArray['CompressRatio'] . "</td>";
											print "<td>" . $qryResultsArray['Quadname'] . "</td>";
											print "<td>" . $qryResultsArray['FileID'] . "</td>";
											print "<td>" . $qryResultsArray['FileName'] . "</td>";
											print "<td>" . $qryResultsArray['URL'] . "</td>";
											print "<td>" . $qryResultsArray['URL2'] . "</td>";
											print "<td>" . $qryResultsArray['ymax'] . "</td>";
											print "<td>" . $qryResultsArray['AltID'] . "</td>";
											print "<td>" . $qryResultsArray['xmin'] . "</td>";
											print "<td>" . $qryResultsArray['xmax'] . "</td>";
											print "<td>" . $qryResultsArray['ymin'] . "</td>";
											print "<td>" . $qryResultsArray['projection'] . "</td>";
											print "<td>" . $qryResultsArray['units'] . "</td>";
											print "<td>" . $qryResultsArray['dsID'] . "</td>";
											print "<td>" . $qryResultsArray['dsName'] . "</td>";
											print "<td>" . $qryResultsArray['dsCreator'] . "</td>";
											print "<td>" . $qryResultsArray['dsLocation'] . "</td>";
											print "<td>" . $qryResultsArray['dsType'] . "</td>";
											print "<td>" . $qryResultsArray['dsDate'] . "</td>";
											print "<td>" . $qryResultsArray['dsURL'] . "</td>";
											print "<td>" . $qryResultsArray['dsPriority'] . "</td>";
											print "<td>" . $qryResultsArray['dsThumb'] . "</td>";
											print "<td>" . $qryResultsArray['Restricted'] . "</td>";
											print "<td>" . $qryResultsArray['Selectable'] . "</td>";
											print "<td>" . $qryResultsArray['catID'] . "</td>";
											print "<td>" . $qryResultsArray['catName'] . "</td>";
											print "<td>" . $qryResultsArray['catPriority'] . "</td>";
											print "<td>" . $qryResultsArray['Restricted'] . "</td>";
											print "<td>" . $qryResultsArray['Selectable'] . "</td>";
											print "</tr>";	// end of row in table
										} 
									?>
								</tbody>
							</table>

						</td>
					</tr>
				</tbody>
			</table>

			<!-- <table width="100%" cellpadding=1 cellspacing=0 border=0>
				<tr>
					<td height="40" class="page_heading">Spatial Datasets within the UTM bounding coordinates of:<br>
						<?php echo round($_GET["xmin"]) ?>, <?php echo round($_GET["ymin"]) ?>) min by (<?php round($_GET["xmax"]) ?>, <?php round($_GET["ymax"]) ?>) max in meters
					</td>
				</tr>


			</table> -->

			<!-- <cfinclude Template="footer.cfm"> -->
		</div>

		<?php 
			include 'closeDbConnection.php';
			include 'footer.php';
		?>
	</body>
</html>