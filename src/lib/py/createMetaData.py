#------------------------------------------------------
# This code uses GDAL library to get band information from 
# Ulysses.agr.gc.ca:8080/GeoServer tif subsets. 

# Created for single band, band 1 .tif analysis
# Reference: GDAL/OGR cookbook, OGR band-class API
# Author:Jiaqi Guo (Max), Andrew Roberts (Dragon)
# Modified date: 2017-04-26 
#-------------------------------------------------------

import os
import sys
from osgeo import gdal
import time
import re
gdal.UseExceptions()


def main ():
    
    # Band number, extent, and input file specified below
    band_num = 1  
    extent = sys.argv[1]
    input_file = sys.argv[2]

    # Using GDAL bulit-in function to open file and get band information, exit when error occur 
    src_ds = gdal.Open(input_file) 
    if src_ds is None:
        print("fail : could not open %s" % input_file)
        sys.exit()

    try:
        srcband = src_ds.GetRasterBand(band_num)
    except:
        print("fail : no band %i found" % band_num)
        sys.exit()


    try:    
        # Create stats on the new tiffs
        srcband.ComputeStatistics(True)

        # Parse the returned metadata dictionary
        metadata = ""
        for key, value in srcband.GetMetadata().items():
            metadata += key + ": " + value + ","
        metadata = metadata.rstrip(',')

        # Sort the returned projection string
        projection = src_ds.GetProjection()
        projection = re.sub(',(?=[a-zA-Z])', '\n\t\t\t ', projection)

        layer =  input_file.split('/')
        extent = extent.split(',')
        minAxis = 'MINX: %s, MINY %s\n' % (extent[0], extent[1] )
        maxAxis = '\t\t\t MAXX: %s, MAXY %s' % (extent[2], extent[3]) 

        # Assign all metadata to formated strings
        dlTime = str("Retrieved on " + time.asctime( time.localtime(time.time())))    
        layer = str( '{:<16}'.format('\t[ LAYER ]') + "= " + layer[3])   
        extent1 = str( '{:<16}'.format('\t[ EXTENT ]') + "= " + minAxis + maxAxis)
        proj = str("\t[ PROJECTION ] = " + projection)
        stats = str("\t[ STATISTICS ] = " + metadata.replace(",", "\n\t\t\t "))    
        noData = str( '{:<16}'.format('\t[ NO DATA ]') + "= " + str(srcband.GetNoDataValue()))
        blockSize = str( '{:<16}'.format('\t[ BLOCKSIZE ]') + "= " + str(srcband.GetBlockSize()))
        dataType = str( '{:<16}'.format('\t[ DATATYPE ]') + "= " + gdal.GetDataTypeName(srcband.DataType))

        # Join complete metadata info
        dataList = "\n".join([dlTime, layer, extent1, proj, stats, noData, blockSize, dataType])

        metaData = open("../php/temp/metadata.txt", "a+")
        metaData.write(dataList + '\n\n')
        metaData.close()        
    except:
        print("fail : python error")
        sys.exit()

    

# throw errors when input parameters are invalid
if __name__ == '__main__':
    main()